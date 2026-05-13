-- Mirro MVP — Core Schema
-- Migration: 001_schema.sql

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── User profiles (extends auth.users) ───────────────────────────────────────
create table public.user_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  tier         text not null default 'free' check (tier in ('free', 'premium')),
  free_tier_limits jsonb not null default '{
    "maxColleagues": 5,
    "maxInteractionsPerDay": 50,
    "maxInsightsPerDay": 5,
    "maxHistoryDays": 7
  }'::jsonb,
  settings     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Colleagues ────────────────────────────────────────────────────────────────
create table public.colleagues (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  name              text not null,
  role              text,
  department        text,
  observations      jsonb default '{}'::jsonb,
  interaction_count integer not null default 0,
  last_interaction  timestamptz,
  profile_status    text not null default 'emerging'
                    check (profile_status in ('emerging', 'developing', 'established')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index colleagues_user_id_idx on public.colleagues(user_id);
create index colleagues_last_interaction_idx on public.colleagues(last_interaction desc nulls last);

-- ── Interactions ──────────────────────────────────────────────────────────────
create table public.interactions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  source           text not null default 'paste'
                   check (source in ('paste', 'slack', 'email', 'calendar')),
  interaction_type text not null
                   check (interaction_type in (
                     'conversation', 'meeting', 'message', 'observation',
                     'morning_reflection', 'evening_reflection'
                   )),
  colleague_id     uuid references public.colleagues(id) on delete set null,
  raw_content      text not null,
  parsed_signals   jsonb default '{}'::jsonb,
  mood_signal      text check (mood_signal in ('energized', 'neutral', 'drained')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index interactions_user_id_idx        on public.interactions(user_id);
create index interactions_colleague_id_idx   on public.interactions(colleague_id);
create index interactions_created_at_idx     on public.interactions(created_at desc);
create index interactions_type_idx           on public.interactions(interaction_type);

-- ── Insights ──────────────────────────────────────────────────────────────────
create table public.insights (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  colleague_id     uuid references public.colleagues(id) on delete set null,
  insight_type     text not null
                   check (insight_type in ('pattern', 'strength', 'friction', 'opportunity')),
  content          jsonb not null default '{}'::jsonb,
  confidence_score float check (confidence_score between 0 and 1),
  requires_hitl    boolean not null default false,
  hitl_reviewed    boolean not null default false,
  hitl_approved    boolean,
  hitl_notes       text,
  dismissed        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index insights_user_id_idx      on public.insights(user_id);
create index insights_colleague_id_idx on public.insights(colleague_id);
create index insights_hitl_idx         on public.insights(requires_hitl, hitl_reviewed)
             where requires_hitl = true and hitl_reviewed = false;
create index insights_created_at_idx   on public.insights(created_at desc);

-- ── Trigger: auto-create user_profile on signup ───────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Trigger: update interaction_count + last_interaction on colleagues ─────────
create or replace function public.update_colleague_on_interaction()
returns trigger language plpgsql security definer as $$
begin
  if new.colleague_id is not null then
    update public.colleagues
    set
      interaction_count = interaction_count + 1,
      last_interaction  = new.created_at,
      profile_status = case
        when interaction_count + 1 >= 10 then 'established'
        when interaction_count + 1 >= 3  then 'developing'
        else 'emerging'
      end,
      updated_at = now()
    where id = new.colleague_id;
  end if;
  return new;
end;
$$;

create trigger on_interaction_created
  after insert on public.interactions
  for each row execute procedure public.update_colleague_on_interaction();
