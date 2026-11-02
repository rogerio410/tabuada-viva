-- O professor só vê criança com vínculo autorizado pelo responsável DA criança, vigente, e nunca escreve.
do $$
declare m uuid;
begin
  perform tests.seed();

  perform tests.as_user('t1');
  perform tests.eq('select 1 from public.child_profile', 0, 'sem vínculo: professor não vê criança');
  perform tests.eq('select 1 from public.fact_state', 0, 'sem vínculo: professor não vê fact_state');
  perform tests.eq('select 1 from public.attempt', 0, 'sem vínculo: professor não vê attempt');
  perform tests.eq('select 1 from public.session', 0, 'sem vínculo: professor não vê sessão');
  perform tests.eq('select 1 from public.reward_wallet', 0, 'sem vínculo: professor não vê carteira');
  perform tests.eq('select 1 from public.class_group', 1, 'professor vê a própria turma');

  -- responsável autoriza pelo código; só ele, só com código certo
  perform tests.as_user('g1');
  perform tests.fails(format('select public.authorize_class_membership(%L, ''errado'')', tests.u('c1')), 'código inválido é recusado', 'P0002');
  perform tests.fails(format('select public.authorize_class_membership(%L, ''codigo-k1'')', tests.u('c2')), 'g1 não autoriza criança de g2', '42501');
  perform tests.fails(format('insert into public.class_membership (class_id, child_id, authorized_by) values (%L, %L, %L)', tests.u('k1'), tests.u('c1'), tests.u('g1')),
    'vínculo não se cria por insert direto', '42501');
  m := public.authorize_class_membership(tests.u('c1'), 'codigo-k1');
  perform tests.ok(m is not null, 'g1 autoriza o vínculo c1 -> k1');

  perform tests.as_user('t1');
  perform tests.eq('select 1 from public.child_profile', 1, 'com vínculo: professor vê a criança autorizada');
  perform tests.eq('select 1 from public.child_profile where id = tests.u(''c2'')', 0, 'professor não vê criança não autorizada');
  perform tests.eq('select 1 from public.fact_state', 1, 'com vínculo: professor vê fact_state');
  perform tests.eq('select 1 from public.attempt', 1, 'com vínculo: professor vê attempt');
  perform tests.eq('select 1 from public.session', 1, 'com vínculo: professor vê sessão');
  perform tests.eq('select 1 from public.reward_wallet', 1, 'com vínculo: professor vê carteira');
  perform tests.eq('select 1 from public.consent', 0, 'professor nunca vê consentimento');
  perform tests.eq('select 1 from public.class_membership', 1, 'professor vê o vínculo da própria turma');

  -- nunca escreve nos dados da criança
  perform tests.fails(format('insert into public.attempt (child_id, session_id, item_id, answer, correct, time_ms, created_at) values (%L, %L, ''i'', 1, true, 1, now())', tests.u('c1'), tests.u('s-c1')),
    'professor não grava attempt', '42501');
  perform tests.fails(format('insert into public.fact_state (child_id, fact_id, status) values (%L, ''add:9+9'', ''novo'')', tests.u('c1')),
    'professor não grava fact_state', '42501');
  perform tests.ok(tests.affected($q$update public.child_profile set nickname = 'X' where id = tests.u('c1')$q$) = 0,
    'professor não altera a criança');
  perform tests.ok(tests.affected($q$update public.reward_wallet set cajus = 999$q$) = 0,
    'professor não altera a carteira');
  perform tests.fails('delete from public.attempt', 'professor não apaga attempt', '42501');
  perform tests.ok(tests.affected($q$update public.class_membership set revoked_at = null$q$) = 0,
    'professor não mexe no vínculo');

  -- outro professor não vê
  perform tests.as_user('t2');
  perform tests.eq('select 1 from public.child_profile', 0, 't2 (sem vínculo) não vê a criança');
  perform tests.eq('select 1 from public.class_membership', 0, 't2 não vê o vínculo de outra turma');

  -- revogar corta o acesso na hora
  perform tests.as_user('g1');
  update public.class_membership set revoked_at = now() where child_id = tests.u('c1');
  perform tests.as_user('t1');
  perform tests.eq('select 1 from public.child_profile', 0, 'vínculo revogado: professor perde a criança');
  perform tests.eq('select 1 from public.attempt', 0, 'vínculo revogado: professor perde os attempts');
  perform tests.eq('select 1 from public.class_membership', 0, 'vínculo revogado: some da turma');

  -- reautorizar devolve o acesso
  perform tests.as_user('g1');
  perform public.authorize_class_membership(tests.u('c1'), 'codigo-k1');
  perform tests.as_user('t1');
  perform tests.eq('select 1 from public.child_profile', 1, 'reautorizado: professor volta a ver');

  -- vínculo forjado (autorizado por quem não é o responsável da criança) não vale
  perform tests.as_admin();
  delete from public.class_membership;
  insert into public.class_membership (class_id, child_id, authorized_by) values (tests.u('k1'), tests.u('c1'), tests.u('g2'));
  perform tests.as_user('t1');
  perform tests.eq('select 1 from public.child_profile', 0, 'vínculo autorizado por outro adulto não vale');

  -- sem autorização não existe vínculo (NOT NULL)
  perform tests.as_admin();
  perform tests.fails(format('insert into public.class_membership (class_id, child_id, authorized_by, authorized_at) values (%L, %L, %L, null)', tests.u('k1'), tests.u('c2'), tests.u('g2')),
    'vínculo sem authorized_at é impossível', '23502');

  -- responsável sem consentimento não autoriza; só professor cria turma
  perform tests.as_admin();
  delete from public.consent where child_id = tests.u('c2');
  perform tests.as_user('g2');
  perform tests.fails(format('select public.authorize_class_membership(%L, ''codigo-k1'')', tests.u('c2')), 'sem consentimento não autoriza vínculo', '42501');
  perform tests.fails(format('insert into public.class_group (teacher_id, name) values (%L, ''Turma'')', tests.u('g2')), 'responsável não cria turma', '42501');
end $$;
