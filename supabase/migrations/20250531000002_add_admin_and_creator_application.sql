-- Add roles table
create table roles (
  id text primary key,
  description text
);

-- Insert basic roles
insert into roles (id, description) values
  ('user', 'Normal user who can book and join calls'),
  ('creator', 'Creator who can host calls'),
  ('admin', 'Administrator with full access');

-- Create user_roles junction table
create table user_roles (
  user_id uuid references profiles(id) on delete cascade,
  role_id text references roles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, role_id)
);

-- All users get the 'user' role by default
create or replace function add_default_role()
returns trigger as $$
begin
  insert into user_roles (user_id, role_id)
  values (new.id, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on profiles
  for each row
  execute function add_default_role();

-- Enable RLS
alter table roles enable row level security;
alter table user_roles enable row level security;

-- RLS Policies
create policy "Roles are viewable by everyone"
  on roles for select
  using (true);

create policy "User roles are viewable by everyone"
  on user_roles for select
  using (true);

create policy "Only admins can manage roles"
  on roles for all
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role_id = 'admin'
    )
  );

create policy "Only admins can manage user roles"
  on user_roles for all
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role_id = 'admin'
    )
  );

-- Create creator applications table
create table creator_applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  message text,
  admin_feedback text,
  reviewed_by uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add trigger for updated_at
create trigger update_creator_applications_updated_at
  before update on creator_applications
  for each row
  execute function update_updated_at_column();

-- Enable RLS
alter table creator_applications enable row level security;

-- RLS Policies for creator_applications
create policy "Users can view their own applications"
  on creator_applications for select
  using (auth.uid() = user_id);

create policy "Users can create their own applications"
  on creator_applications for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from creator_applications
      where user_id = auth.uid()
      and status = 'pending'
    )
  );

create policy "Admins can view all applications"
  on creator_applications for select
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role_id = 'admin'
    )
  );

create policy "Admins can update applications"
  on creator_applications for update
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role_id = 'admin'
    )
  );

-- Add indexes
create index idx_creator_applications_status on creator_applications(status);
create index idx_creator_applications_user_id on creator_applications(user_id);
create index idx_user_roles_user_id on user_roles(user_id);
create index idx_user_roles_role_id on user_roles(role_id);

-- Update creators policies
create policy "Only admins can insert creators"
  on creators for insert
  with check (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role_id = 'admin'
    )
  );

-- Function to handle creator approval
create or replace function handle_creator_approval()
returns trigger as $$
begin
  if new.status = 'approved' and old.status = 'pending' then
    -- Add creator role
    insert into user_roles (user_id, role_id)
    values (new.user_id, 'creator');
    
    -- Create creator record
    insert into creators (id)
    values (new.user_id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for creator approval
create trigger on_creator_approval
  after update on creator_applications
  for each row
  execute function handle_creator_approval(); 