-- Ajudantes de teste. Cada teste é um bloco DO que levanta exceção se algo falha.
create schema tests;
grant usage on schema tests to anon, authenticated;

create function tests.u(n text) returns uuid language sql immutable as $$ select md5('tv-' || n)::uuid $$;

create function tests.as_admin() returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', '', true);
end $$;

create function tests.as_user(n text) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', tests.u(n)::text, true);
  execute 'set local role authenticated';
end $$;

create function tests.as_anon() returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', '', true);
  execute 'set local role anon';
end $$;

create function tests.ok(cond boolean, msg text) returns void language plpgsql as $$
begin
  if cond is not true then raise exception 'FALHOU: %', msg; end if;
  raise notice 'ok - %', msg;
end $$;

create function tests.count(q text) returns bigint language plpgsql as $$
declare n bigint;
begin
  execute 'select count(*) from (' || q || ') t' into n;
  return n;
end $$;

create function tests.eq(q text, expected bigint, msg text) returns void language plpgsql as $$
declare n bigint := tests.count(q);
begin
  if n is distinct from expected then raise exception 'FALHOU: % (esperado %, veio %)', msg, expected, n; end if;
  raise notice 'ok - %', msg;
end $$;

-- Linhas afetadas por um insert/update/delete (RLS filtra: 0 = nada casou).
create function tests.affected(q text) returns bigint language plpgsql as $$
declare n bigint;
begin
  execute q;
  get diagnostics n = row_count;
  return n;
end $$;

-- A consulta TEM de falhar; opcionalmente com um SQLSTATE específico.
create function tests.fails(q text, msg text, expected_state text default null) returns void language plpgsql as $$
declare st text;
begin
  begin
    execute q;
  exception when others then
    get stacked diagnostics st = returned_sqlstate;
    if expected_state is not null and st <> expected_state then
      raise exception 'FALHOU: % (SQLSTATE esperado %, veio %)', msg, expected_state, st;
    end if;
    raise notice 'ok - %', msg;
    return;
  end;
  raise exception 'FALHOU: % (deveria falhar e não falhou)', msg;
end $$;

-- Dados-base (como administrador): g1, g2 responsáveis; t1, t2 professores; c1 de g1, c2 de g2; turma k1 de t1.
create function tests.reset() returns void language plpgsql as $$
begin
  perform tests.as_admin();
  truncate public.adult cascade;
  delete from auth.users;
  update public.app_config set value = 'v1' where key = 'current_terms_version';
end $$;

create function tests.seed() returns void language plpgsql as $$
declare n text;
begin
  perform tests.reset();
  foreach n in array array['g1', 'g2', 't1', 't2'] loop
    insert into auth.users (id, email) values (tests.u(n), n || '@exemplo.test');
    insert into public.adult (id, role)
      values (tests.u(n), case when left(n, 1) = 't' then 'professor' else 'responsavel' end);
  end loop;
  insert into public.child_profile (id, guardian_id, nickname, school_year) values
    (tests.u('c1'), tests.u('g1'), 'Ana', 2),
    (tests.u('c2'), tests.u('g2'), 'Beto', 2);
  insert into public.consent (guardian_id, child_id, terms_version) values
    (tests.u('g1'), tests.u('c1'), 'v1'),
    (tests.u('g2'), tests.u('c2'), 'v1');
  foreach n in array array['c1', 'c2'] loop
    insert into public.session (id, child_id, started_at) values (tests.u('s-' || n), tests.u(n), now());
    insert into public.fact_state (child_id, fact_id, status) values (tests.u(n), 'add:3+4', 'aprendendo');
    insert into public.attempt (child_id, session_id, item_id, fact_id, answer, correct, time_ms, created_at)
      values (tests.u(n), tests.u('s-' || n), 'i1', 'add:3+4', 7, true, 2000, now());
    insert into public.reward_wallet (child_id, cajus) values (tests.u(n), 10);
  end loop;
  insert into public.class_group (id, teacher_id, name, invite_code) values (tests.u('k1'), tests.u('t1'), '2º A', 'codigo-k1');
end $$;
