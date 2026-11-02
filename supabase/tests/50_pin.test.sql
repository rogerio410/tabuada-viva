-- PIN: hash no servidor, limite de tentativas e bloqueio crescente (D22).
do $$
declare r jsonb; i int; s jsonb;
begin
  perform tests.seed();

  perform tests.as_user('g1');
  perform tests.fails('select public.set_adult_pin(''12a4'', null)', 'PIN com letra é recusado', '22023');
  perform tests.fails('select public.set_adult_pin(''123'', null)', 'PIN curto é recusado', '22023');
  s := public.set_adult_pin('4321'); -- primeiro PIN: não pede PIN atual
  perform tests.ok((s->>'ok')::bool, 'primeiro PIN é definido sem PIN atual');

  perform tests.as_admin();
  perform tests.ok((select pin_hash from public.adult where id = tests.u('g1')) <> '4321'
                   and (select pin_hash from public.adult where id = tests.u('g1')) like '$2a$10$%', 'PIN guardado como bcrypt (custo 10), nunca em texto');

  perform tests.as_user('g1');
  r := public.verify_adult_pin('4321');
  perform tests.ok((r->>'ok')::bool and not (r->>'locked')::bool, 'PIN certo passa');

  -- 4 falhas: ainda sem bloqueio, tentativas caindo
  for i in 1..4 loop
    r := public.verify_adult_pin('0000');
  end loop;
  perform tests.ok(not (r->>'ok')::bool and not (r->>'locked')::bool and (r->>'attempts_left')::int = 1, '4 falhas: sem bloqueio, resta 1 tentativa');

  -- certo no meio zera
  r := public.verify_adult_pin('4321');
  perform tests.ok((r->>'ok')::bool, 'sucesso zera as falhas');
  r := public.verify_adult_pin('0000');
  perform tests.ok((r->>'attempts_left')::int = 4, 'depois do sucesso volta a ter 5 tentativas');

  -- 5ª falha bloqueia 15 min
  for i in 1..4 loop r := public.verify_adult_pin('0000'); end loop;
  perform tests.ok((r->>'locked')::bool and (r->>'retry_after_seconds')::int = 900, '5ª falha: bloqueio de 15 min');

  -- bloqueado: nem o PIN certo entra
  r := public.verify_adult_pin('4321');
  perform tests.ok(not (r->>'ok')::bool and (r->>'locked')::bool, 'bloqueado: PIN certo também é recusado');

  -- passou o prazo: destrava
  perform tests.as_admin();
  update public.pin_guard set locked_until = now() - interval '1 second' where adult_id = tests.u('g1');
  perform tests.as_user('g1');
  -- 2º ciclo de falhas: bloqueio dobra (30 min)
  for i in 1..5 loop r := public.verify_adult_pin('0000'); end loop;
  perform tests.ok((r->>'locked')::bool and (r->>'retry_after_seconds')::int = 1800, '2º ciclo: bloqueio de 30 min');

  -- teto de 24 h
  perform tests.as_admin();
  update public.pin_guard set locked_until = now() - interval '1 second', lock_level = 20 where adult_id = tests.u('g1');
  perform tests.as_user('g1');
  for i in 1..5 loop r := public.verify_adult_pin('0000'); end loop;
  perform tests.ok((r->>'retry_after_seconds')::int = 86400, 'bloqueio nunca passa de 24 h');

  -- sucesso depois do bloqueio zera o nível
  perform tests.as_admin();
  update public.pin_guard set locked_until = now() - interval '1 second' where adult_id = tests.u('g1');
  perform tests.as_user('g1');
  r := public.verify_adult_pin('4321');
  perform tests.as_admin();
  perform tests.ok((select lock_level from public.pin_guard where adult_id = tests.u('g1')) = 0, 'sucesso zera o nível de bloqueio');

  -- quem nunca definiu PIN recebe o mesmo formato de resposta e também é limitado
  perform tests.as_user('g2');
  r := public.verify_adult_pin('1234');
  perform tests.ok(not (r->>'ok')::bool and r ? 'attempts_left' and r ? 'locked' and r ? 'retry_after_seconds', 'sem PIN: mesma resposta, sem revelar que não há PIN');
  for i in 1..4 loop r := public.verify_adult_pin('1234'); end loop;
  perform tests.ok((r->>'locked')::bool, 'sem PIN: também bloqueia na 5ª falha');

  -- um adulto não afeta o contador do outro
  perform tests.as_user('g1');
  r := public.verify_adult_pin('4321');
  perform tests.ok((r->>'ok')::bool, 'o bloqueio de g2 não afeta g1');

  -- trocar o PIN: exige o PIN atual e passa pelo mesmo limite
  perform tests.as_user('g1');
  s := public.set_adult_pin('9999');
  perform tests.ok(not (s->>'ok')::bool, 'trocar o PIN sem o PIN atual é recusado');
  s := public.set_adult_pin('9999', '0000');
  perform tests.ok(not (s->>'ok')::bool, 'trocar o PIN com o PIN atual errado é recusado');
  r := public.verify_adult_pin('4321');
  perform tests.ok((r->>'ok')::bool, 'o PIN antigo continua valendo depois das tentativas de troca recusadas');
  -- tentar trocar às cegas consome o limite e bloqueia (anula o ataque de quem está com a sessão aberta)
  for i in 1..5 loop s := public.set_adult_pin('9999', '0000'); end loop;
  perform tests.ok((s->>'locked')::bool, 'tentativas de troca com PIN errado bloqueiam na 5ª');
  s := public.set_adult_pin('9999', '4321');
  perform tests.ok(not (s->>'ok')::bool and (s->>'locked')::bool, 'durante o bloqueio nem o PIN atual certo troca o PIN');
  r := public.verify_adult_pin('9999');
  perform tests.ok(not (r->>'ok')::bool, 'o PIN novo não foi gravado durante o bloqueio');
  perform tests.as_admin();
  update public.pin_guard set locked_until = now() - interval '1 second' where adult_id = tests.u('g1');
  perform tests.as_user('g1');
  s := public.set_adult_pin('9999', '4321');
  perform tests.ok((s->>'ok')::bool, 'PIN atual certo, fora do bloqueio: troca permitida');
  r := public.verify_adult_pin('9999');
  perform tests.ok((r->>'ok')::bool, 'o PIN novo passa a valer');
  perform tests.as_admin();
  perform tests.ok((select lock_level from public.pin_guard where adult_id = tests.u('g1')) = 0, 'a troca bem-sucedida zera o nível pelo sucesso, não por reset do guard');

  -- quem ainda não tem PIN e está bloqueado: definir PIN não destrava
  perform tests.as_user('g2');
  s := public.set_adult_pin('1111');
  r := public.verify_adult_pin('1111');
  perform tests.ok((r->>'locked')::bool, 'definir PIN não zera o bloqueio de quem já estava bloqueado');
end $$;
