-- ===========================================================================
-- GHS — initial schema
--
-- Implements the production side of the api seam (GHS_ProductArchitecture.md).
-- The screens do not change when this goes live; only the bodies of api.*
-- (src/services/supabaseApi.ts) start pointing here instead of at the bundle.
--
-- Design notes carried from the architecture document:
--   §4  every row carries church_id, and isolation is enforced by row-level
--       security keyed off the caller's JWT — never a WHERE clause in app code
--   §5  the review pipeline is a state machine with an audit trail
--   §6  consent records exist before any voice/likeness feature could
--   §8  guardrails are constraints, not conventions
--   §13 scripture is NOT stored here — it is immutable, openly licensed and
--       bundled with the client, so the reader works offline
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type review_status as enum (
  'draft',
  'pending_review',
  'approved',
  'held',
  'removed'
);

create type member_role as enum ('member', 'author', 'reviewer', 'admin', 'pastor');

-- The artifact-of-the-day guardrail as a database constraint: places and
-- objects only. There is deliberately no 'person' value, so "never depict
-- Christ, apostles, or any living person" cannot be violated by an INSERT.
create type artifact_kind as enum ('place', 'object', 'inscription', 'structure');

-- ---------------------------------------------------------------------------
-- Tenancy — §4
-- ---------------------------------------------------------------------------

create table churches (
  id                 text primary key,
  name_en            text not null,
  name_ml            text not null,
  subtitle_en        text not null default '',
  subtitle_ml        text not null default '',
  parent_church_id   text references churches (id) on delete set null,
  -- Brand tokens as data, so one build serves many branded tenants.
  theme              jsonb not null default '{}'::jsonb,
  -- The per-tenant component registry, and the entitlement mechanism.
  enabled_components text[] not null default array['today', 'scroll'],
  created_at         timestamptz not null default now()
);

comment on column churches.enabled_components is
  'Per-tenant component registry (§4). Also the packaging/entitlement mechanism.';

create table memberships (
  user_id      uuid not null references auth.users (id) on delete cascade,
  church_id    text not null references churches (id) on delete cascade,
  role         member_role not null default 'member',
  display_name text not null,
  initials     text not null,
  -- The comment allow-list (§14.2). In the demo this is a set on the church;
  -- in production it is this flag. The api seam hides the difference.
  can_comment  boolean not null default false,
  created_at   timestamptz not null default now(),
  primary key (user_id, church_id)
);

create index memberships_church_idx on memberships (church_id);

-- Which churches the caller belongs to. SECURITY DEFINER so the policies below
-- can consult it without recursing through memberships' own RLS.
create or replace function auth_church_ids()
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select church_id from memberships where user_id = auth.uid()
$$;

create or replace function auth_can_comment(target_church text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select can_comment from memberships
      where user_id = auth.uid() and church_id = target_church),
    false)
$$;

-- ---------------------------------------------------------------------------
-- The Today page — §14
-- ---------------------------------------------------------------------------

create table questions (
  id            uuid primary key default gen_random_uuid(),
  church_id     text not null references churches (id) on delete cascade,
  date          date not null,
  prompt_en     text not null,
  prompt_ml     text not null,
  scripture_ref text not null default '',
  status        review_status not null default 'draft',
  -- Human-authored and human-approved, never generated (§14.1). NOT NULL on
  -- author_id is the schema-level form of that promise.
  author_id     uuid not null references auth.users (id),
  author_name   text not null,
  approved_by   uuid references auth.users (id),
  approved_at   timestamptz,
  created_at    timestamptz not null default now(),

  unique (church_id, date),
  -- Approved content must name its approver, and no one may approve their own.
  constraint approved_rows_have_an_approver
    check (status <> 'approved' or (approved_by is not null and approved_at is not null)),
  constraint author_cannot_approve_own_question
    check (approved_by is null or approved_by <> author_id)
);

create index questions_church_date_idx on questions (church_id, date desc);

create table reflections (
  id          uuid primary key default gen_random_uuid(),
  church_id   text not null references churches (id) on delete cascade,
  question_id uuid references questions (id) on delete cascade,
  author_id   uuid not null references auth.users (id),
  author_name text not null,
  author_role member_role not null default 'member',
  is_pastor   boolean not null default false,
  body_en     text not null,
  body_ml     text not null default '',
  status      review_status not null default 'draft',
  created_at  timestamptz not null default now()
);

create index reflections_church_idx on reflections (church_id, question_id);

create table comments (
  id              uuid primary key default gen_random_uuid(),
  target_id       text not null,
  church_id       text not null references churches (id) on delete cascade,
  author_id       uuid not null references auth.users (id) default auth.uid(),
  author_name     text not null default '',
  author_initials text not null default '',
  body            text not null,
  status          review_status not null default 'approved',
  created_at      timestamptz not null default now(),

  constraint comment_body_not_empty check (length(btrim(body)) > 0)
);

create index comments_target_idx on comments (target_id, created_at);

-- Fill the author's display fields from their membership, so a client cannot
-- post a comment under somebody else's name.
create or replace function comments_set_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.author_id := auth.uid();
  select display_name, initials into new.author_name, new.author_initials
    from memberships
   where user_id = auth.uid() and church_id = new.church_id;
  return new;
end;
$$;

create trigger comments_set_author_trg
  before insert on comments
  for each row execute function comments_set_author();

-- ---------------------------------------------------------------------------
-- Artifacts — §14.3
-- ---------------------------------------------------------------------------

create table artifacts (
  id           text primary key,
  name         text not null,
  kind         artifact_kind not null,
  blurb        text not null default '',
  image_url    text,
  -- Human sign-off on the image. "Never unreviewed" applies to media too.
  image_review jsonb not null default
    '{"status":"pending","reviewedBy":"","reviewedAt":"","note":""}'::jsonb,
  -- §8: "every Artifact has a non-empty sourceUrl (Wikipedia attribution)".
  source_url   text not null,
  source_label text not null default 'Wikipedia',
  bible_refs   text[] not null default '{}',
  location     text not null default '',
  period       text not null default '',

  constraint artifact_source_url_present check (length(btrim(source_url)) > 0),
  -- An image may only be displayed once a named human has cleared it.
  constraint approved_image_names_a_reviewer check (
    image_review ->> 'status' <> 'approved'
    or (length(btrim(coalesce(image_review ->> 'reviewedBy', ''))) > 0
        and image_url is not null)
  )
);

-- ---------------------------------------------------------------------------
-- Review pipeline audit trail — §5
-- ---------------------------------------------------------------------------

create table review_events (
  id          uuid primary key default gen_random_uuid(),
  church_id   text not null references churches (id) on delete cascade,
  entity_type text not null check (entity_type in ('question', 'reflection', 'comment', 'feedItem')),
  entity_id   uuid not null,
  from_status review_status not null,
  to_status   review_status not null,
  actor_id    uuid not null references auth.users (id),
  note        text,
  at          timestamptz not null default now()
);

create index review_events_entity_idx on review_events (entity_id, at desc);

-- The allowed transitions, in one place. A move not listed here is rejected.
create or replace function assert_valid_transition(from_status review_status, to_status review_status)
returns boolean
language sql
immutable
as $$
  select (from_status, to_status) in (
    ('draft',          'pending_review'),
    ('pending_review', 'approved'),
    ('pending_review', 'held'),
    ('pending_review', 'draft'),
    ('approved',       'held'),
    ('approved',       'removed'),
    ('held',           'pending_review'),
    ('held',           'removed')
  )
$$;

alter table review_events
  add constraint review_event_is_a_legal_transition
  check (assert_valid_transition(from_status, to_status));

-- ---------------------------------------------------------------------------
-- Consent — §6
-- Exists before any voice/likeness feature could. No such feature ships
-- without a revocable, written consent record.
-- ---------------------------------------------------------------------------

create table consent_records (
  id          uuid primary key default gen_random_uuid(),
  church_id   text not null references churches (id) on delete cascade,
  subject_id  uuid not null references auth.users (id),
  scope       text not null,
  granted_at  timestamptz not null default now(),
  revoked_at  timestamptz,
  document_url text not null,

  constraint consent_is_written check (length(btrim(document_url)) > 0)
);

-- ===========================================================================
-- Row-level security — §4
--
-- This is the security boundary. The .eq('church_id') filters in
-- supabaseApi.ts narrow *within* what these policies already permit; they are
-- not what keeps one tenant out of another's data.
-- ===========================================================================

alter table churches       enable row level security;
alter table memberships    enable row level security;
alter table questions      enable row level security;
alter table reflections    enable row level security;
alter table comments       enable row level security;
alter table artifacts      enable row level security;
alter table review_events  enable row level security;
alter table consent_records enable row level security;

-- Tenant records: readable only by their own members.
create policy churches_read_own on churches
  for select using (id in (select auth_church_ids()));

create policy memberships_read_own_church on memberships
  for select using (church_id in (select auth_church_ids()));

-- Member-facing content: own tenant, and approved only.
-- The "approved only" half is the database's copy of the never-unreviewed
-- guardrail — the client filters too, and neither is trusted alone (§5).
create policy questions_read_approved on questions
  for select using (
    church_id in (select auth_church_ids()) and status = 'approved'
  );

create policy reflections_read_approved on reflections
  for select using (
    church_id in (select auth_church_ids()) and status = 'approved'
  );

create policy comments_read_approved on comments
  for select using (
    church_id in (select auth_church_ids()) and status = 'approved'
  );

-- THE COMMENT GATE (§14.2). This is the real gate; the UI check is a courtesy.
-- A reader who is not on the allow-list cannot insert, whatever the client does.
create policy comments_insert_if_allowed on comments
  for insert with check (
    church_id in (select auth_church_ids())
    and auth_can_comment(church_id)
  );

-- An author may withdraw their own comment; nobody may edit somebody else's.
create policy comments_update_own on comments
  for update using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- Artifacts are shared reference content, readable by any signed-in member.
create policy artifacts_read_all on artifacts
  for select using (auth.uid() is not null);

create policy review_events_read_own_church on review_events
  for select using (church_id in (select auth_church_ids()));

create policy consent_read_own on consent_records
  for select using (subject_id = auth.uid() or church_id in (select auth_church_ids()));

-- Note on authoring and review: inserting a draft, submitting it, and
-- approving it are performed by reviewers and admins through policies that
-- belong with the Content Studio surface (GHS_DemoBuild.md), not with the two
-- read-mostly surfaces this migration supports. They are deliberately absent
-- rather than stubbed permissively — an over-broad policy written "for now" is
-- how the never-unreviewed guarantee gets lost.
