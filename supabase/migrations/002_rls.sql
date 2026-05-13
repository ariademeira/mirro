-- Mirro MVP — Row-Level Security Policies
-- Migration: 002_rls.sql
-- All tables locked to authenticated user's own data.

-- ── Enable RLS ────────────────────────────────────────────────────────────────
alter table public.user_profiles enable row level security;
alter table public.colleagues     enable row level security;
alter table public.interactions   enable row level security;
alter table public.insights       enable row level security;

-- ── user_profiles ─────────────────────────────────────────────────────────────
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- ── colleagues ────────────────────────────────────────────────────────────────
create policy "Users can view own colleagues"
  on public.colleagues for select
  using (auth.uid() = user_id);

create policy "Users can create colleagues"
  on public.colleagues for insert
  with check (auth.uid() = user_id);

create policy "Users can update own colleagues"
  on public.colleagues for update
  using (auth.uid() = user_id);

create policy "Users can delete own colleagues"
  on public.colleagues for delete
  using (auth.uid() = user_id);

-- ── interactions ──────────────────────────────────────────────────────────────
create policy "Users can view own interactions"
  on public.interactions for select
  using (auth.uid() = user_id);

create policy "Users can create interactions"
  on public.interactions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own interactions"
  on public.interactions for delete
  using (auth.uid() = user_id);

-- ── insights ──────────────────────────────────────────────────────────────────
create policy "Users can view own non-HITL-blocked insights"
  on public.insights for select
  using (
    auth.uid() = user_id
    and (requires_hitl = false or hitl_reviewed = true)
    and dismissed = false
  );

create policy "Users can dismiss own insights"
  on public.insights for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Admin: HITL review (service role only; no RLS bypass for regular users) ───
-- HITL queue accessed by edge functions running with service_role key.
-- Regular users cannot read requires_hitl=true rows unless hitl_reviewed=true (above).
