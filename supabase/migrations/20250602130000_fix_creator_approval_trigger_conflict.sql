-- Fix the handle_creator_approval trigger to handle duplicate key conflicts
-- This prevents errors when approving applications for users who already have creator role

CREATE OR REPLACE FUNCTION handle_creator_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Add creator role with ON CONFLICT DO NOTHING
    INSERT INTO user_roles (user_id, role_id)
    VALUES (NEW.user_id, 'creator')
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    -- Create creator record with ON CONFLICT DO NOTHING
    INSERT INTO creators (id)
    VALUES (NEW.user_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;