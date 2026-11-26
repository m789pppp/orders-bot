-- Orders Bot database
-- Supabase: SQL Editor > New query > paste ALL of this > Run

create extension if not exists "pgcrypto";

do $$ begin
  create type order_status as enum ('NEW','PENDING_REVIEW','CONTACTED','APPROVED','REJECTED');
exception when duplicate_object then null; end $$;

create table if not exists admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,                                   -- lets the admin log in with phone + password
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  status text not null default 'collecting',          -- collecting | submitted
  language text not null default 'ar',
  draft jsonb not null default '{}'::jsonb,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists conversations_customer_idx on conversations (customer_id, created_at desc);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  wamid text unique,                                   -- WhatsApp message id: blocks duplicates
  direction text not null,                             -- in | out
  type text not null default 'text',
  body text,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists messages_conv_idx on messages (conversation_id, created_at);

create sequence if not exists order_code_seq start 1001;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique default ('ORD-' || nextval('order_code_seq')),
  customer_id uuid not null references customers(id),
  conversation_id uuid references conversations(id),
  customer_name text,
  product_type text not null,
  quantity int,
  colors text,
  sizes text,
  customization text,
  notes text,
  status order_status not null default 'NEW',
  submitted_at timestamptz not null default now()
);
create index if not exists orders_status_idx on orders (status, submitted_at desc);

create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  storage_path text not null,
  mime text,
  size_bytes int,
  original_name text,
  created_at timestamptz not null default now()
);

create table if not exists order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);

create table if not exists order_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  author uuid references auth.users(id),
  body text not null,
  created_at timestamptz not null default now()
);

-- Lock everything: with RLS on and no policies, the public keys can read nothing.
-- The app's server uses the secret service key and checks admin_profiles itself.
alter table admin_profiles enable row level security;
alter table customers enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table orders enable row level security;
alter table attachments enable row level security;
alter table order_status_history enable row level security;
alter table order_notes enable row level security;

-- Private bucket for customer images and files
insert into storage.buckets (id, name, public)
values ('order-files', 'order-files', false)
on conflict (id) do nothing;
