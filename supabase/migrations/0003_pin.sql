-- PIN do adulto (D22, valores PROVISÓRIOS em public.app_config). O PIN é um portão do painel, não a autenticação
-- (essa é o login do Supabase): com 4 dígitos há só 10 000 combinações, então o limite de tentativas é a defesa.
-- O PIN nunca é guardado nem registrado em texto puro; o cliente nunca lê pin_hash.

alter default privileges in schema public revoke all on functions from public, anon, authenticated;

create function public.set_adult_pin(p_pin text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_pin is null or p_pin !~ '^[0-9]{4}$' then
    raise exception 'invalid_pin_format' using errcode = '22023';
  end if;
  update public.adult
     set pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf', 8))
   where id = auth.uid();
  if not found then
    raise exception 'adult_not_found' using errcode = 'P0002';
  end if;
  -- trocar o PIN (com o adulto logado) zera o bloqueio
  delete from public.pin_guard where adult_id = auth.uid();
end $$;

-- Devolve sempre o mesmo formato, exista ou não um PIN, para não revelar se há PIN cadastrado.
create function public.verify_adult_pin(p_pin text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_max int := (select value::int from public.app_config where key = 'pin_max_failures');
  v_base int := (select value::int from public.app_config where key = 'pin_base_lock_seconds');
  v_cap int := (select value::int from public.app_config where key = 'pin_max_lock_seconds');
  v_guard public.pin_guard%rowtype;
  v_hash text;
  v_ok boolean;
  v_lock_seconds int;
begin
  if v_uid is null then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into public.pin_guard (adult_id) values (v_uid) on conflict (adult_id) do nothing;
  select * into v_guard from public.pin_guard where adult_id = v_uid for update;

  if v_guard.locked_until is not null and v_guard.locked_until > now() then
    return jsonb_build_object(
      'ok', false, 'locked', true,
      'retry_after_seconds', ceil(extract(epoch from (v_guard.locked_until - now())))::int,
      'attempts_left', 0);
  end if;

  select pin_hash into v_hash from public.adult where id = v_uid;
  -- sempre roda o bcrypt (contra um hash fixo se não há PIN) para o tempo não revelar nada
  v_ok := extensions.crypt(coalesce(p_pin, ''), coalesce(v_hash, '$2a$08$abcdefghijklmnopqrstuuJ1fK0QmQ9g1yq9s6j9c8kqZx0k8y2e6'))
          = coalesce(v_hash, 'x')
          and v_hash is not null and p_pin ~ '^[0-9]{4}$';

  if v_ok then
    update public.pin_guard set failures = 0, lock_level = 0, locked_until = null where adult_id = v_uid;
    return jsonb_build_object('ok', true, 'locked', false, 'retry_after_seconds', 0, 'attempts_left', v_max);
  end if;

  if v_guard.failures + 1 >= v_max then
    v_lock_seconds := least(v_base::numeric * power(2, v_guard.lock_level), v_cap)::int;
    update public.pin_guard
       set failures = 0, lock_level = lock_level + 1, locked_until = now() + make_interval(secs => v_lock_seconds)
     where adult_id = v_uid;
    return jsonb_build_object('ok', false, 'locked', true, 'retry_after_seconds', v_lock_seconds, 'attempts_left', 0);
  end if;

  update public.pin_guard set failures = failures + 1 where adult_id = v_uid;
  return jsonb_build_object(
    'ok', false, 'locked', false, 'retry_after_seconds', 0, 'attempts_left', v_max - (v_guard.failures + 1));
end $$;

revoke all on function public.set_adult_pin(text), public.verify_adult_pin(text) from public, anon;
grant execute on function public.set_adult_pin(text), public.verify_adult_pin(text) to authenticated;
