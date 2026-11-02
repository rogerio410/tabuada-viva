-- Cobertura: nenhuma tabela sem RLS; anon não toca em nada.
do $$
declare t text;
begin
  perform tests.seed();
  for t in select tablename from pg_tables where schemaname = 'public' loop
    perform tests.ok(
      (select rowsecurity from pg_tables where schemaname = 'public' and tablename = t),
      'RLS ligado em public.' || t);
  end loop;

  perform tests.as_anon();
  for t in select tablename from pg_tables where schemaname = 'public' loop
    perform tests.fails('select * from public.' || quote_ident(t), 'anon não lê public.' || t, '42501');
  end loop;
  perform tests.fails('select public.verify_adult_pin(''1234'')', 'anon não chama verify_adult_pin', '42501');
  perform tests.fails('select public.delete_child_data(tests.u(''c1''))', 'anon não chama delete_child_data', '42501');
  perform tests.fails('select public.authorize_class_membership(tests.u(''c1''), ''x'')', 'anon não autoriza vínculo', '42501');

  -- a criança não tem conta: não existe papel para ela; o cliente nunca vê pin_hash
  perform tests.as_user('g1');
  perform tests.fails('select pin_hash from public.adult', 'authenticated não lê pin_hash', '42501');
  perform tests.fails('select * from public.pin_guard', 'authenticated não lê pin_guard', '42501');
end $$;
