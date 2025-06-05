-- Add missing indexes for better query performance

-- 1. Date field indexes for common sorting and filtering
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creators_created_at ON creators(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_products_created_at ON call_products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_products_updated_at ON call_products(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_bookings_created_at ON call_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);

-- 2. Composite indexes for common query patterns
-- Call products: search creator's active products
CREATE INDEX IF NOT EXISTS idx_call_products_creator_status ON call_products(creator_id, status);

-- Call bookings: user booking history
CREATE INDEX IF NOT EXISTS idx_call_bookings_user_status ON call_bookings(user_id, status, created_at DESC);

-- Call bookings: creator booking management
CREATE INDEX IF NOT EXISTS idx_call_bookings_creator_status ON call_bookings(creator_id, status, created_at DESC);

-- Queue participants: queue management
CREATE INDEX IF NOT EXISTS idx_queue_participants_plan_position_status ON queue_participants(plan_id, position, status);

-- Creator applications: admin application management
CREATE INDEX IF NOT EXISTS idx_creator_applications_status_created ON creator_applications(status, created_at DESC);

-- 3. Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_reservations_queue_setting_id ON reservations(queue_setting_id);
CREATE INDEX IF NOT EXISTS idx_reservations_fixed_slot_id ON reservations(fixed_slot_id);
CREATE INDEX IF NOT EXISTS idx_reservation_statuses_reservation_id ON reservation_statuses(reservation_id);
CREATE INDEX IF NOT EXISTS idx_call_rooms_reservation_id ON call_rooms(reservation_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reservation_id ON ratings(reservation_id);
CREATE INDEX IF NOT EXISTS idx_creator_queue_settings_creator_id ON creator_queue_settings(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_fixed_slots_creator_id ON creator_fixed_slots(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_applications_reviewed_by ON creator_applications(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_current_queue_calls_creator_id ON current_queue_calls(creator_id);
CREATE INDEX IF NOT EXISTS idx_current_queue_calls_participant_id ON current_queue_calls(participant_id);
CREATE INDEX IF NOT EXISTS idx_queue_participants_user_id ON queue_participants(user_id);

-- 4. Partial indexes for specific use cases
-- Active queue systems search
CREATE INDEX IF NOT EXISTS idx_call_products_active_queue ON call_products(type, status, slot_date) 
WHERE type = 'queue' AND status = 'active';

-- In-progress calls search
CREATE INDEX IF NOT EXISTS idx_call_bookings_in_progress ON call_bookings(creator_id, status) 
WHERE status = 'in_progress';

-- Online creators search
CREATE INDEX IF NOT EXISTS idx_creators_online ON creators(is_online) 
WHERE is_online = true;

-- Approved creators search
CREATE INDEX IF NOT EXISTS idx_creator_applications_approved ON creator_applications(user_id, status) 
WHERE status = 'approved';

-- 5. Additional performance indexes for queue system
-- Queue participants waiting status
CREATE INDEX IF NOT EXISTS idx_queue_participants_waiting ON queue_participants(plan_id, position) 
WHERE status = 'waiting';

-- Current active calls
CREATE INDEX IF NOT EXISTS idx_current_queue_calls_active ON current_queue_calls(plan_id, status) 
WHERE status = 'active';

-- Call products with available slots
CREATE INDEX IF NOT EXISTS idx_call_products_available_slots ON call_products(type, status, remaining_slots) 
WHERE type = 'queue' AND status = 'active' AND remaining_slots > 0;