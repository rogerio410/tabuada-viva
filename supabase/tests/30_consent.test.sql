-- Sem consentimento da versão vigente não se grava dado da criança; a prova é append-only.
do $$
begin
  perform tests.seed();
  perform tests.as_admin();
  insert into public.child_profile (id, guardian_id, nickname, school_year) values (tests.u('c3'), tests.u('g1'), 'Caio', 2);
  insert into public.session (id, child_id, started_at) values (tests.u('s-c3'), tests.u('c3'), now()); -- admin ignora RLS

  perform tests.as_user('g1');
  perform tests.fails(
    format('insert into public.fact_state (child_id, fact_id, status) values (%L, ''add:1+1'', ''novo'')', tests.u('c3')),
    'sem consentimento: fact_state é recusado', '42501');
  perform tests.fails(
    format('insert into public.session (child_id, started_at) values (%L, now())', tests.u('c3')),
    'sem consentimento: session é recusada', '42501');
  perform tests.fails(
    format('insert into public.reward_wallet (child_id) values (%L)', tests.u('c3')),
    'sem consentimento: carteira é recusada', '42501');
  perform tests.fails(
    format('insert into public.attempt (child_id, session_id, item_id, answer, correct, time_ms, created_at) values (%L, %L, ''i'', 1, true, 1, now())',
      tests.u('c3'), tests.u('s-c3')),
    'sem consentimento: attempt é recusado', '42501');

  -- consentir (versão vigente) libera
  insert into public.consent (guardian_id, child_id, terms_version) values (tests.u('g1'), tests.u('c3'), 'v1');
  insert into public.fact_state (child_id, fact_id, status) values (tests.u('c3'), 'add:1+1', 'novo');
  perform tests.ok(true, 'com consentimento v1: fact_state é aceito');

  -- só a versão vigente e só pelo responsável da criança
  perform tests.fails(
    format('insert into public.consent (guardian_id, child_id, terms_version) values (%L, %L, ''v0'')', tests.u('g1'), tests.u('c1')),
    'consentimento de versão antiga é recusado', '42501');
  perform tests.fails(
    format('insert into public.consent (guardian_id, child_id, terms_version) values (%L, %L, ''v1'')', tests.u('g1'), tests.u('c2')),
    'g1 não consente pela criança de g2', '42501');
  perform tests.fails(
    format('insert into public.consent (guardian_id, child_id, terms_version) values (%L, null, ''v1'')', tests.u('g1')),
    'consentimento sem criança é recusado', '42501');

  -- append-only
  perform tests.fails('update public.consent set terms_version = ''v9''', 'consent não admite update', '42501');
  perform tests.fails('delete from public.consent', 'consent não admite delete', '42501');

  -- termo novo: escrita para até reconsentir
  perform tests.as_admin();
  update public.app_config set value = 'v2' where key = 'current_terms_version';
  perform tests.as_user('g1');
  perform tests.fails(
    format('insert into public.fact_state (child_id, fact_id, status) values (%L, ''add:2+2'', ''novo'')', tests.u('c1')),
    'termo novo: escrita bloqueada até reconsentir', '42501');
  perform tests.eq('select 1 from public.fact_state where child_id = tests.u(''c1'')', 1, 'termo novo: leitura continua');
  insert into public.consent (guardian_id, child_id, terms_version) values (tests.u('g1'), tests.u('c1'), 'v2');
  insert into public.fact_state (child_id, fact_id, status) values (tests.u('c1'), 'add:2+2', 'novo');
  perform tests.ok(true, 'reconsentiu v2: escrita liberada');
end $$;
