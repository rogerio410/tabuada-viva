-- Direito de apagar: só o responsável, tudo da criança, nada de outra.
do $$
declare r jsonb;
begin
  perform tests.seed();
  perform tests.as_user('g1');
  perform public.authorize_class_membership(tests.u('c1'), 'codigo-k1');

  perform tests.as_user('g2');
  perform tests.fails(format('select public.delete_child_data(%L)', tests.u('c1')), 'g2 não apaga a criança de g1', '42501');
  perform tests.as_user('t1');
  perform tests.fails(format('select public.delete_child_data(%L)', tests.u('c1')), 'professor não apaga criança', '42501');

  perform tests.as_user('g1');
  r := public.delete_child_data(tests.u('c1'));
  perform tests.ok((r->>'attempt')::int = 1 and (r->>'fact_state')::int = 1 and (r->>'session')::int = 1
                   and (r->>'reward_wallet')::int = 1 and (r->>'class_membership')::int = 1 and (r->>'child_profile')::int = 1,
                   'devolve a contagem apagada por tabela');
  perform tests.ok(not (r::text ~* 'ana'), 'o recibo não traz dado da criança');

  perform tests.as_admin();
  perform tests.eq('select 1 from public.child_profile where id = tests.u(''c1'')', 0, 'perfil apagado');
  perform tests.eq('select 1 from public.fact_state where child_id = tests.u(''c1'')', 0, 'fact_state apagado');
  perform tests.eq('select 1 from public.attempt where child_id = tests.u(''c1'')', 0, 'attempt apagado');
  perform tests.eq('select 1 from public.session where child_id = tests.u(''c1'')', 0, 'sessão apagada');
  perform tests.eq('select 1 from public.reward_wallet where child_id = tests.u(''c1'')', 0, 'carteira apagada');
  perform tests.eq('select 1 from public.class_membership where child_id = tests.u(''c1'')', 0, 'vínculo apagado');

  perform tests.eq('select 1 from public.child_profile where id = tests.u(''c2'')', 1, 'a criança de g2 continua');
  perform tests.eq('select 1 from public.attempt where child_id = tests.u(''c2'')', 1, 'attempts de g2 continuam');
  perform tests.eq('select 1 from public.reward_wallet where child_id = tests.u(''c2'')', 1, 'carteira de g2 continua');

  perform tests.eq('select 1 from public.consent where guardian_id = tests.u(''g1'') and child_id is null', 1,
                   'a prova de consentimento fica sem child_id (nada que identifique a criança)');
  perform tests.eq('select 1 from public.consent where child_id = tests.u(''c1'')', 0, 'consentimento não aponta mais para a criança');

  perform tests.fails(format('select public.delete_child_data(%L)', tests.u('c1')), 'apagar de novo falha (criança não existe mais)', '42501');

  -- apagar a conta do adulto leva tudo (cascata a partir de auth.users)
  perform tests.as_admin();
  delete from auth.users where id = tests.u('g2');
  perform tests.eq('select 1 from public.child_profile', 0, 'apagar o adulto apaga as crianças dele');
  perform tests.eq('select 1 from public.consent where guardian_id = tests.u(''g2'')', 0, 'apagar o adulto apaga as provas de consentimento dele');
end $$;
