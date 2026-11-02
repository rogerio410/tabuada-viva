-- RLS em TODAS as tabelas. O cliente (anon/authenticated) só tem os privilégios listados aqui.

-- ---------- funções auxiliares (security definer: leem sem depender das policies do chamador) ----------

create function public.current_terms_version() returns text
language sql stable security definer set search_path = '' as $$
  select value from public.app_config where key = 'current_terms_version'
$$;

create function public.is_guardian_of(p_child uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.child_profile c where c.id = p_child and c.guardian_id = auth.uid()
  )
$$;

create function public.is_teacher() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.adult a where a.id = auth.uid() and a.role = 'professor')
$$;

-- O professor só vê a criança com vínculo vigente (não revogado) autorizado pelo responsável DA criança.
create function public.teacher_can_view(p_child uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_teacher() and exists (
    select 1
    from public.class_membership m
    join public.class_group g on g.id = m.class_id
    join public.child_profile c on c.id = m.child_id
    where m.child_id = p_child
      and g.teacher_id = auth.uid()
      and m.revoked_at is null
      and m.authorized_by = c.guardian_id
  )
$$;

create function public.has_current_consent(p_child uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.consent k
    where k.child_id = p_child and k.terms_version = public.current_terms_version()
  )
$$;

-- O responsável autoriza o vínculo informando o código de convite da turma (a turma não fica listada para ele).
create function public.authorize_class_membership(p_child uuid, p_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_class uuid;
  v_id uuid;
begin
  if auth.uid() is null or not public.is_guardian_of(p_child) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if not public.has_current_consent(p_child) then
    raise exception 'consent_required' using errcode = '42501';
  end if;
  select id into v_class from public.class_group where invite_code = p_code;
  if v_class is null then
    raise exception 'invalid_code' using errcode = 'P0002';
  end if;
  insert into public.class_membership (class_id, child_id, authorized_by, authorized_at)
  values (v_class, p_child, auth.uid(), now())
  on conflict (class_id, child_id)
  do update set revoked_at = null, authorized_by = auth.uid(), authorized_at = now()
  returning id into v_id;
  return v_id;
end $$;

-- ---------- privilégios: começa fechado ----------

revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant usage on schema public to anon, authenticated;
grant execute on function
  public.current_terms_version(), public.is_guardian_of(uuid), public.is_teacher(),
  public.teacher_can_view(uuid), public.has_current_consent(uuid), public.authorize_class_membership(uuid, text)
  to authenticated;

grant select on public.app_config to authenticated;
-- pin_hash e pin_guard ficam fora: só as funções do 0003 os tocam.
grant select (id, role, created_at), insert (id, role) on public.adult to authenticated;
grant select, insert on public.child_profile to authenticated;
grant update (nickname, avatar, school_year) on public.child_profile to authenticated;
grant select on public.class_group to authenticated;
grant insert (name, school, teacher_id), update (name, school), delete on public.class_group to authenticated;
grant select on public.class_membership to authenticated;
grant update (revoked_at) on public.class_membership to authenticated;
grant select, insert (guardian_id, child_id, terms_version) on public.consent to authenticated;
grant select, insert, update on public.session, public.fact_state, public.reward_wallet to authenticated;
grant select, insert on public.attempt to authenticated;

-- ---------- RLS ligado em todas as tabelas ----------

alter table public.app_config enable row level security;
alter table public.adult enable row level security;
alter table public.pin_guard enable row level security;
alter table public.child_profile enable row level security;
alter table public.class_group enable row level security;
alter table public.class_membership enable row level security;
alter table public.consent enable row level security;
alter table public.session enable row level security;
alter table public.fact_state enable row level security;
alter table public.attempt enable row level security;
alter table public.reward_wallet enable row level security;

-- ---------- policies ----------

create policy app_config_read on public.app_config for select to authenticated using (true);

create policy adult_self_select on public.adult for select to authenticated using (id = auth.uid());
create policy adult_self_insert on public.adult for insert to authenticated with check (id = auth.uid());
-- pin_guard: sem policy = ninguém acessa direto.

create policy child_guardian_select on public.child_profile for select to authenticated
  using (guardian_id = auth.uid());
create policy child_teacher_select on public.child_profile for select to authenticated
  using (public.teacher_can_view(id));
create policy child_guardian_insert on public.child_profile for insert to authenticated
  with check (guardian_id = auth.uid());
create policy child_guardian_update on public.child_profile for update to authenticated
  using (guardian_id = auth.uid()) with check (guardian_id = auth.uid());
-- sem delete direto: apagar passa por delete_child_data (0004), que devolve a contagem.

create policy class_teacher_select on public.class_group for select to authenticated
  using (teacher_id = auth.uid());
create policy class_teacher_insert on public.class_group for insert to authenticated
  with check (teacher_id = auth.uid() and public.is_teacher());
create policy class_teacher_update on public.class_group for update to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy class_teacher_delete on public.class_group for delete to authenticated
  using (teacher_id = auth.uid());

create policy membership_guardian_select on public.class_membership for select to authenticated
  using (public.is_guardian_of(child_id));
create policy membership_teacher_select on public.class_membership for select to authenticated
  using (
    revoked_at is null
    and public.teacher_can_view(child_id)
    and exists (select 1 from public.class_group g where g.id = class_id and g.teacher_id = auth.uid())
  );
create policy membership_guardian_revoke on public.class_membership for update to authenticated
  using (public.is_guardian_of(child_id)) with check (public.is_guardian_of(child_id));
-- criar vínculo: só pela função authorize_class_membership.

-- Consentimento: só insert/select (append-only) e só da versão vigente.
create policy consent_guardian_select on public.consent for select to authenticated
  using (guardian_id = auth.uid());
create policy consent_guardian_insert on public.consent for insert to authenticated
  with check (
    guardian_id = auth.uid()
    and child_id is not null
    and public.is_guardian_of(child_id)
    and terms_version = public.current_terms_version()
  );

-- Dados de aprendizagem: o responsável lê e grava (com consentimento vigente); o professor só lê, com vínculo.
create policy session_guardian_select on public.session for select to authenticated
  using (public.is_guardian_of(child_id));
create policy session_teacher_select on public.session for select to authenticated
  using (public.teacher_can_view(child_id));
create policy session_guardian_insert on public.session for insert to authenticated
  with check (public.is_guardian_of(child_id) and public.has_current_consent(child_id));
create policy session_guardian_update on public.session for update to authenticated
  using (public.is_guardian_of(child_id))
  with check (public.is_guardian_of(child_id) and public.has_current_consent(child_id));

create policy fact_state_guardian_select on public.fact_state for select to authenticated
  using (public.is_guardian_of(child_id));
create policy fact_state_teacher_select on public.fact_state for select to authenticated
  using (public.teacher_can_view(child_id));
create policy fact_state_guardian_insert on public.fact_state for insert to authenticated
  with check (public.is_guardian_of(child_id) and public.has_current_consent(child_id));
create policy fact_state_guardian_update on public.fact_state for update to authenticated
  using (public.is_guardian_of(child_id))
  with check (public.is_guardian_of(child_id) and public.has_current_consent(child_id));

create policy reward_wallet_guardian_select on public.reward_wallet for select to authenticated
  using (public.is_guardian_of(child_id));
create policy reward_wallet_teacher_select on public.reward_wallet for select to authenticated
  using (public.teacher_can_view(child_id));
create policy reward_wallet_guardian_insert on public.reward_wallet for insert to authenticated
  with check (public.is_guardian_of(child_id) and public.has_current_consent(child_id));
create policy reward_wallet_guardian_update on public.reward_wallet for update to authenticated
  using (public.is_guardian_of(child_id))
  with check (public.is_guardian_of(child_id) and public.has_current_consent(child_id));

-- attempt é append-only: sem update nem delete para o cliente.
create policy attempt_guardian_select on public.attempt for select to authenticated
  using (public.is_guardian_of(child_id));
create policy attempt_teacher_select on public.attempt for select to authenticated
  using (public.teacher_can_view(child_id));
create policy attempt_guardian_insert on public.attempt for insert to authenticated
  with check (
    public.is_guardian_of(child_id)
    and public.has_current_consent(child_id)
    -- a sessão tem de ser da mesma criança (a FK sozinha não garante)
    and exists (select 1 from public.session s where s.id = session_id and s.child_id = attempt.child_id)
  );
