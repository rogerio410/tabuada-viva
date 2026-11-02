-- Tabuada Viva: modelo de dados (fonte L346-360). Coleta mínima (LGPD art. 14): só apelido, ano escolar e respostas.
-- Nenhuma coluna de texto livre da criança: as únicas colunas de texto digitadas por pessoas são o apelido
-- (digitado pelo adulto, com formato restrito), o nome da turma e a escola da turma (professor).

create extension if not exists pgcrypto with schema extensions;

-- Configuração lida pelo app e pelas funções. Os valores do PIN são PROVISÓRIOS (D22) e iguais aos de
-- src/domain/config/security.ts (scripts/test-db.mjs confere).
create table public.app_config (
  key text primary key,
  value text not null
);
insert into public.app_config (key, value) values
  ('current_terms_version', 'v1'),
  ('pin_max_failures', '5'),
  ('pin_base_lock_seconds', '900'),
  ('pin_max_lock_seconds', '86400');

-- Única conta com login (Supabase Auth guarda o e-mail em auth.users; não duplicamos).
create table public.adult (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('responsavel', 'professor')),
  pin_hash text, -- bcrypt; nunca o PIN, nunca legível pelo cliente
  created_at timestamptz not null default now()
);

-- Estado do limite de tentativas do PIN (D22). Só as funções do 0003 mexem aqui.
create table public.pin_guard (
  adult_id uuid primary key references public.adult (id) on delete cascade,
  failures int not null default 0 check (failures >= 0),
  lock_level int not null default 0 check (lock_level >= 0),
  locked_until timestamptz
);

create table public.child_profile (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.adult (id) on delete cascade,
  -- sem dígitos, @, / ou : (impede telefone, e-mail e link no apelido)
  nickname text not null check (nickname ~ '^[^0-9@/:]{1,20}$'),
  avatar text check (avatar ~ '^[a-z0-9-]{1,40}$'), -- id de item pré-definido, nunca imagem enviada
  school_year smallint not null check (school_year between 1 and 5),
  created_at timestamptz not null default now()
);
create index child_profile_guardian_idx on public.child_profile (guardian_id);

create table public.class_group (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.adult (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  school text check (char_length(school) <= 80),
  invite_code text not null unique default substr(md5(gen_random_uuid()::text), 1, 10),
  created_at timestamptz not null default now()
);

-- Vínculo autorizado pelo responsável (L353). authorized_at NOT NULL: sem autorização não há vínculo.
create table public.class_membership (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.class_group (id) on delete cascade,
  child_id uuid not null references public.child_profile (id) on delete cascade,
  authorized_by uuid not null references public.adult (id) on delete cascade,
  authorized_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (class_id, child_id)
);
create index class_membership_child_idx on public.class_membership (child_id);

-- Prova do consentimento. Append-only para o cliente. Se a criança for apagada, a linha fica sem child_id
-- (nada que identifique a criança); se a conta do adulto for apagada, some junto (ver docs/privacidade).
create table public.consent (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.adult (id) on delete cascade,
  child_id uuid references public.child_profile (id) on delete set null,
  terms_version text not null check (char_length(terms_version) between 1 and 20),
  accepted_at timestamptz not null default now()
);
create index consent_child_idx on public.consent (child_id);

create table public.session (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profile (id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  item_count int not null default 0 check (item_count >= 0),
  accuracy numeric(4, 3) check (accuracy between 0 and 1)
);
create index session_child_idx on public.session (child_id);

create table public.fact_state (
  child_id uuid not null references public.child_profile (id) on delete cascade,
  fact_id text not null check (fact_id ~ '^(add|sub|mul|div):[0-9]+[-+x/][0-9]+$'),
  status text not null check (status in ('novo', 'aprendendo', 'praticando', 'fluente', 'dominado')),
  next_review timestamptz,
  streak int not null default 0 check (streak >= 0),
  fast_days date[] not null default '{}',
  correct int not null default 0 check (correct >= 0),
  wrong int not null default 0 check (wrong >= 0),
  median_ms int check (median_ms >= 0),
  primary key (child_id, fact_id)
);

create table public.attempt (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profile (id) on delete cascade,
  session_id uuid not null references public.session (id) on delete cascade,
  item_id text not null check (item_id ~ '^[A-Za-z0-9:_.-]{1,64}$'),
  fact_id text check (fact_id ~ '^(add|sub|mul|div):[0-9]+[-+x/][0-9]+$'),
  answer int not null,
  correct boolean not null,
  time_ms int not null check (time_ms >= 0), -- só para o adulto; nunca mostrado à criança
  supports_used text[] not null default '{}'
    check (supports_used <@ array['dedos', 'quadro-de-dez', 'reta', 'contas', 'grupos', 'tabela']),
  error_type text check (error_type in (
    'added_instead_of_multiplied', 'off_by_one_group', 'swapped_subtraction', 'wrong_operation',
    'multiplied_instead_of_divided', 'used_wrong_divisor', 'money_change_error', 'other')),
  phase_id text check (phase_id ~ '^W[1-9]-P[0-9]{2}$'),
  kind text not null default 'fact' check (kind in ('fact', 'family', 'story', 'proof')),
  created_at timestamptz not null
);
create index attempt_child_idx on public.attempt (child_id, created_at);
create index attempt_session_idx on public.attempt (session_id);

create table public.reward_wallet (
  child_id uuid primary key references public.child_profile (id) on delete cascade,
  cajus int not null default 0 check (cajus >= 0),
  piggy_bank int not null default 0 check (piggy_bank >= 0),
  stars jsonb not null default '{}' check (jsonb_typeof(stars) = 'object'),
  stickers text[] not null default '{}'
);
