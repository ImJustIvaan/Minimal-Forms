-- Minimal Forms initial schema
-- Auth is handled by Clerk, not Supabase Auth. All application access goes
-- through server-side code using the service_role key, which bypasses RLS.
-- RLS is enabled with no policies as defense-in-depth against the anon/
-- authenticated roles, which this app never uses to talk to the database.

create table if not exists forms (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  title text not null default 'Untitled form',
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  accepting_responses boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forms_owner_id_idx on forms (owner_id);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms (id) on delete cascade,
  type text not null check (
    type in (
      'short_text', 'long_text', 'email', 'number',
      'multiple_choice', 'checkboxes', 'dropdown',
      'rating', 'date', 'yes_no'
    )
  ),
  title text not null default '',
  description text not null default '',
  required boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists questions_form_id_idx on questions (form_id, position);

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms (id) on delete cascade,
  submitted_at timestamptz not null default now(),
  respondent_meta jsonb not null default '{}'::jsonb
);

create index if not exists responses_form_id_idx on responses (form_id);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references responses (id) on delete cascade,
  question_id uuid not null references questions (id) on delete cascade,
  value jsonb not null default 'null'::jsonb
);

create index if not exists answers_response_id_idx on answers (response_id);
create index if not exists answers_question_id_idx on answers (question_id);

alter table forms enable row level security;
alter table questions enable row level security;
alter table responses enable row level security;
alter table answers enable row level security;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists forms_set_updated_at on forms;
create trigger forms_set_updated_at
  before update on forms
  for each row
  execute function set_updated_at();
