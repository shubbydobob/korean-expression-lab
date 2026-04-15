create type content_status as enum ('draft', 'reviewed', 'published', 'archived');
create type audience_type as enum ('both', 'foreign_learner', 'korean_english_learner');
create type language_code as enum ('ko', 'en');
create type prompt_task as enum (
  'correction',
  'expression_recommendation',
  'lesson_generation',
  'difficulty_adaptation',
  'reading_quiz_generation',
  'video_script_generation'
);

create table admin_users (
  id uuid primary key,
  email text not null unique,
  role text not null default 'editor',
  created_at timestamptz not null default now()
);

create table prompt_templates (
  id uuid primary key,
  task prompt_task not null,
  slug text not null unique,
  title text not null,
  description text not null,
  input_schema jsonb not null,
  output_schema jsonb not null,
  created_at timestamptz not null default now()
);

create table prompt_versions (
  id uuid primary key,
  template_id uuid not null references prompt_templates(id),
  version integer not null,
  model text not null,
  system_prompt text not null,
  instructions jsonb not null,
  status text not null default 'draft',
  notes text not null default '',
  last_eval_run_id uuid,
  last_eval_score numeric(5,2),
  is_active boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (template_id, version)
);

create table contents (
  id uuid primary key,
  slug text not null unique,
  title text not null,
  summary text not null,
  audience audience_type not null,
  status content_status not null default 'draft',
  source_language language_code not null default 'ko',
  target_language language_code not null default 'en',
  difficulty integer not null default 1,
  topic_tags text[] not null default '{}',
  body jsonb not null,
  approved_by uuid references admin_users(id),
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table expressions (
  id uuid primary key,
  phrase text not null,
  language language_code not null,
  nuance text not null,
  context_note text not null,
  example_sentences jsonb not null,
  content_id uuid references contents(id),
  created_at timestamptz not null default now()
);

create table correction_cases (
  id uuid primary key,
  input_text text not null,
  corrected_text text not null,
  explanation jsonb not null,
  source language_code not null default 'ko',
  tone text not null,
  created_at timestamptz not null default now()
);

create table eval_sets (
  id uuid primary key,
  name text not null unique,
  task prompt_task not null,
  description text not null,
  score_threshold integer not null default 80,
  cases jsonb not null,
  created_at timestamptz not null default now()
);

create table eval_runs (
  id uuid primary key,
  eval_set_id uuid not null references eval_sets(id),
  prompt_version_id uuid not null references prompt_versions(id),
  score numeric(5,2) not null,
  result_summary jsonb not null,
  executed_at timestamptz not null default now()
);

create table ai_runs (
  id text primary key,
  task prompt_task not null,
  prompt_template_id uuid not null references prompt_templates(id),
  prompt_version_id uuid not null references prompt_versions(id),
  prompt_version integer not null,
  model text not null,
  prompt_fingerprint text not null,
  prompt_snapshot jsonb not null,
  input_payload jsonb not null,
  output_payload jsonb not null,
  used_fallback boolean not null default false,
  fallback_reason text,
  error_message text,
  created_at timestamptz not null default now()
);

create table media_scripts (
  id uuid primary key,
  content_id uuid not null references contents(id),
  status text not null default 'draft',
  narration text not null,
  scene_plan jsonb not null,
  youtube_metadata jsonb not null,
  created_at timestamptz not null default now()
);

create table publish_jobs (
  id uuid primary key,
  media_script_id uuid not null references media_scripts(id),
  target text not null,
  status text not null default 'pending',
  payload jsonb not null,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
