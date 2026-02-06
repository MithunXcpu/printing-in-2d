-- Printing in 2D — Supabase Database Schema
-- Run this in the Supabase SQL Editor to create all tables

-- Users table (synced from Clerk via webhook)
create table if not exists users (
  id text primary key,                    -- Clerk user ID
  email text,
  name text,
  image_url text,
  stripe_customer_id text,
  subscription_status text default 'free', -- free | pro | team
  created_at timestamptz default now()
);

-- Sessions
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  avatar_key text not null,
  phase text default 'interview',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  role text not null,
  content text,
  image_url text,
  tool_calls jsonb,
  created_at timestamptz default now()
);

-- Workflow nodes
create table if not exists workflow_nodes (
  id text not null,
  session_id uuid references sessions(id) on delete cascade,
  label text,
  type text,
  icon text,
  description text,
  image_url text,
  x float default 0,
  y float default 0,
  primary key (session_id, id)
);

-- Workflow connections
create table if not exists workflow_connections (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  from_node text,
  to_node text,
  label text
);

-- Interview profiles
create table if not exists interview_profiles (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade unique,
  role text,
  department text,
  company_context text,
  desired_outcomes jsonb default '[]',
  pain_points jsonb default '[]',
  current_tools jsonb default '[]',
  data_sources jsonb default '[]'
);

-- Work orders
create table if not exists work_orders (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  order_index int,
  title text,
  description text,
  implementation_plan text,
  suggested_files jsonb,
  dependencies jsonb,
  complexity text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Enable RLS on all tables
alter table users enable row level security;
alter table sessions enable row level security;
alter table messages enable row level security;
alter table workflow_nodes enable row level security;
alter table workflow_connections enable row level security;
alter table interview_profiles enable row level security;
alter table work_orders enable row level security;

-- RLS policies: service role key bypasses RLS,
-- but add basic policies for any future client-side access
create policy "Users can read own data" on users for select using (true);
create policy "Sessions belong to user" on sessions for all using (true);
create policy "Messages belong to session" on messages for all using (true);
create policy "Nodes belong to session" on workflow_nodes for all using (true);
create policy "Connections belong to session" on workflow_connections for all using (true);
create policy "Profiles belong to session" on interview_profiles for all using (true);
create policy "Work orders belong to session" on work_orders for all using (true);

-- Indexes for common queries
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_messages_session_id on messages(session_id);
create index if not exists idx_workflow_nodes_session_id on workflow_nodes(session_id);
create index if not exists idx_workflow_connections_session_id on workflow_connections(session_id);
