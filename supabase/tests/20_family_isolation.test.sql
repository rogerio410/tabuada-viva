-- Uma família não vê nem altera a outra.
do $$
begin
  perform tests.seed();

  perform tests.as_user('g1');
  perform tests.eq('select 1 from public.child_profile', 1, 'g1 vê só 1 criança');
  perform tests.eq('select 1 from public.child_profile where id = tests.u(''c2'')', 0, 'g1 não vê a criança de g2');
  perform tests.eq('select 1 from public.fact_state', 1, 'g1 vê só o fact_state da própria criança');
  perform tests.eq('select 1 from public.attempt', 1, 'g1 vê só os attempts da própria criança');
  perform tests.eq('select 1 from public.session', 1, 'g1 vê só as sessões da própria criança');
  perform tests.eq('select 1 from public.reward_wallet', 1, 'g1 vê só a carteira da própria criança');
  perform tests.eq('select 1 from public.consent', 1, 'g1 vê só o próprio consentimento');
  perform tests.eq('select 1 from public.adult', 1, 'g1 vê só a própria linha de adulto');

  perform tests.fails(
    format('insert into public.child_profile (guardian_id, nickname, school_year) values (%L, ''X'', 2)', tests.u('g2')),
    'g1 não cria criança em nome de g2', '42501');
  perform tests.fails(
    format('insert into public.attempt (child_id, session_id, item_id, answer, correct, time_ms, created_at) values (%L, %L, ''i'', 1, true, 1, now())',
      tests.u('c2'), tests.u('s-c2')),
    'g1 não grava attempt na criança de g2', '42501');
  perform tests.fails(
    format('insert into public.fact_state (child_id, fact_id, status) values (%L, ''add:1+1'', ''novo'')', tests.u('c2')),
    'g1 não grava fact_state na criança de g2', '42501');

  -- update de linha alheia não casa nenhuma linha (RLS filtra): 0 linhas afetadas
  perform tests.ok(
    tests.affected($q$update public.child_profile set nickname = 'Hack' where id = tests.u('c2')$q$) = 0,
    'g1 não altera a criança de g2');
  perform tests.ok(
    tests.affected($q$update public.reward_wallet set cajus = 999 where child_id = tests.u('c2')$q$) = 0,
    'g1 não altera a carteira de g2');

  perform tests.fails('delete from public.child_profile where id = tests.u(''c1'')', 'sem delete direto de criança', '42501');
  perform tests.fails('update public.attempt set correct = false', 'attempt é append-only (sem update)', '42501');
  perform tests.fails('delete from public.attempt', 'attempt é append-only (sem delete)', '42501');
  perform tests.fails('update public.child_profile set guardian_id = tests.u(''g2'') where id = tests.u(''c1'')',
    'não dá para transferir a criança para outro adulto', '42501');
  perform tests.fails('update public.adult set role = ''professor''', 'o papel não muda depois de criado', '42501');

  -- formato do apelido: sem número, e-mail, link ou telefone
  perform tests.fails(
    format('insert into public.child_profile (guardian_id, nickname, school_year) values (%L, ''ana@x.com'', 2)', tests.u('g1')),
    'apelido não aceita e-mail', '23514');
  perform tests.fails(
    format('insert into public.child_profile (guardian_id, nickname, school_year) values (%L, ''Ana 8599999'', 2)', tests.u('g1')),
    'apelido não aceita número', '23514');
end $$;
