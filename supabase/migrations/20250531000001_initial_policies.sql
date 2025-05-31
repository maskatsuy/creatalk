-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Creators policies
create policy "Creators are viewable by everyone"
  on creators for select
  using ( true );

create policy "Creators can update their own profile"
  on creators for update
  using ( auth.uid() = id );

-- Creator queue settings policies
create policy "Queue settings are viewable by everyone"
  on creator_queue_settings for select
  using ( true );

create policy "Creators can manage their own queue settings"
  on creator_queue_settings for all
  using ( auth.uid() = creator_id );

-- Creator fixed slots policies
create policy "Fixed slots are viewable by everyone"
  on creator_fixed_slots for select
  using ( true );

create policy "Creators can manage their own fixed slots"
  on creator_fixed_slots for all
  using ( auth.uid() = creator_id );

-- Reservations policies
create policy "Users can view their own reservations"
  on reservations for select
  using ( auth.uid() = user_id );

create policy "Creators can view their reservations"
  on reservations for select
  using ( auth.uid() = creator_id );

create policy "Users can create reservations"
  on reservations for insert
  with check ( auth.uid() = user_id );

-- Reservation statuses policies
create policy "Users can view their reservation statuses"
  on reservation_statuses for select
  using (
    exists (
      select 1 from reservations
      where reservations.id = reservation_id
      and (reservations.user_id = auth.uid() or reservations.creator_id = auth.uid())
    )
  );

-- Call rooms policies
create policy "Users can view their call rooms"
  on call_rooms for select
  using (
    exists (
      select 1 from reservations
      where reservations.id = reservation_id
      and (reservations.user_id = auth.uid() or reservations.creator_id = auth.uid())
    )
  );

-- Ratings policies
create policy "Ratings are viewable by everyone"
  on ratings for select
  using ( true );

create policy "Users can create ratings for their reservations"
  on ratings for insert
  with check (
    exists (
      select 1 from reservations
      where reservations.id = reservation_id
      and reservations.user_id = auth.uid()
    )
  ); 