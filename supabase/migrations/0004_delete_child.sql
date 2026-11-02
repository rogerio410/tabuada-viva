-- Direito de apagar (L374): o responsável apaga TODOS os dados da criança. Devolve a contagem por tabela
-- (nunca dado da criança). A prova de consentimento fica sem child_id (ver docs/privacidade/retencao-e-apagamento.md).

create function public.delete_child_data(p_child uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v jsonb;
begin
  if auth.uid() is null or not public.is_guardian_of(p_child) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  v := jsonb_build_object(
    'fact_state', (select count(*) from public.fact_state where child_id = p_child),
    'attempt', (select count(*) from public.attempt where child_id = p_child),
    'session', (select count(*) from public.session where child_id = p_child),
    'reward_wallet', (select count(*) from public.reward_wallet where child_id = p_child),
    'class_membership', (select count(*) from public.class_membership where child_id = p_child),
    'consent_anonymized', (select count(*) from public.consent where child_id = p_child),
    'child_profile', 1);

  delete from public.child_profile where id = p_child; -- cascata; consent.child_id vira null
  return v;
end $$;

revoke all on function public.delete_child_data(uuid) from public, anon;
grant execute on function public.delete_child_data(uuid) to authenticated;

-- Apagar a conta do adulto: remove o login (auth.users) e, em cascata, o adulto, o PIN, as turmas, as crianças e
-- tudo delas, e as provas de consentimento dele. Conferir no Sprint 4 que o papel dono da função pode apagar
-- em auth.users no projeto real.
create function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
