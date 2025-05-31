-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create tables
-- profiles テーブル
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- creators テーブル
create table creators (
  id uuid references profiles(id) on delete cascade primary key,
  bio text,
  is_online boolean default false,
  rating numeric(3,2) check (rating >= 0 and rating <= 5),
  total_ratings integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- creator_queue_settings テーブル
create table creator_queue_settings (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references creators(id) on delete cascade,
  name text not null,
  description text,
  price integer not null check (price >= 0),
  duration integer not null check (duration > 0),
  start_time time not null,
  end_time time not null,
  break_duration integer not null default 0,
  is_recording_enabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- creator_fixed_slots テーブル
create table creator_fixed_slots (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references creators(id) on delete cascade,
  name text not null,
  description text,
  price integer not null check (price >= 0),
  duration integer not null check (duration > 0),
  start_time timestamp with time zone not null,
  is_recording_enabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- reservations テーブル
create table reservations (
  id uuid default gen_random_uuid() primary key,
  queue_setting_id uuid references creator_queue_settings(id) on delete set null,
  fixed_slot_id uuid references creator_fixed_slots(id) on delete set null,
  user_id uuid references profiles(id) on delete cascade,
  creator_id uuid references creators(id) on delete cascade,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (
    (queue_setting_id is not null and fixed_slot_id is null) or
    (queue_setting_id is null and fixed_slot_id is not null)
  )
);

-- reservation_statuses テーブル
create table reservation_statuses (
  id uuid default gen_random_uuid() primary key,
  reservation_id uuid references reservations(id) on delete cascade,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- call_rooms テーブル
create table call_rooms (
  id uuid default gen_random_uuid() primary key,
  reservation_id uuid references reservations(id) on delete cascade,
  daily_room_name text not null,
  daily_room_url text not null,
  recording_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ratings テーブル
create table ratings (
  id uuid default gen_random_uuid() primary key,
  reservation_id uuid references reservations(id) on delete cascade,
  rating numeric(3,2) check (rating >= 0 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index idx_profiles_email on profiles(email);
create index idx_creators_is_online on creators(is_online);
create index idx_reservations_start_time on reservations(start_time);
create index idx_reservations_creator_id on reservations(creator_id);
create index idx_reservation_statuses_status on reservation_statuses(status);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table creators enable row level security;
alter table creator_queue_settings enable row level security;
alter table creator_fixed_slots enable row level security;
alter table reservations enable row level security;
alter table reservation_statuses enable row level security;
alter table call_rooms enable row level security;
alter table ratings enable row level security;

-- Create updated_at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

create trigger update_creators_updated_at
  before update on creators
  for each row
  execute function update_updated_at_column();

create trigger update_creator_queue_settings_updated_at
  before update on creator_queue_settings
  for each row
  execute function update_updated_at_column();

create trigger update_creator_fixed_slots_updated_at
  before update on creator_fixed_slots
  for each row
  execute function update_updated_at_column();

create trigger update_reservations_updated_at
  before update on reservations
  for each row
  execute function update_updated_at_column();

create trigger update_call_rooms_updated_at
  before update on call_rooms
  for each row
  execute function update_updated_at_column(); 