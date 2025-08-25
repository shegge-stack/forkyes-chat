-- Fix RLS policies for user creation

-- Allow service role to insert users (for the trigger)
DROP POLICY IF EXISTS "Users can update their own record" ON users;
DROP POLICY IF EXISTS "Family admins can manage family members" ON users;
DROP POLICY IF EXISTS "Family admins can invite members" ON users;

-- Users can read their own record and family members
-- (This policy already exists, so we'll keep it)

-- Users can update their own record
CREATE POLICY "Users can update their own record" ON users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Family admins can update family members
CREATE POLICY "Family admins can manage family members" ON users
    FOR UPDATE
    USING (
        family_id IN (
            SELECT family_id 
            FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    )
    WITH CHECK (
        family_id IN (
            SELECT family_id 
            FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Allow authenticated users to insert their own user record (for trigger)
CREATE POLICY "Allow user creation via trigger" ON users
    FOR INSERT
    WITH CHECK (id = auth.uid());

-- Family admins can invite new members
CREATE POLICY "Family admins can invite members" ON users
    FOR INSERT
    WITH CHECK (
        family_id IN (
            SELECT family_id 
            FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Update the user creation trigger to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Use INSERT with ON CONFLICT to handle race conditions
  INSERT INTO public.users (id, email, family_id, role, created_at)
  VALUES (
    new.id, 
    new.email, 
    null, -- No family initially
    'member', -- Default role
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE LOG 'Error creating user record: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create a function that users can call to check if their record exists
CREATE OR REPLACE FUNCTION public.ensure_user_record()
RETURNS void AS $$
DECLARE
  current_user_id uuid;
  current_user_email text;
BEGIN
  -- Get current user info
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get email from auth.users
  SELECT email INTO current_user_email
  FROM auth.users 
  WHERE id = current_user_id;
  
  -- Insert user record if it doesn't exist
  INSERT INTO public.users (id, email, family_id, role, created_at)
  VALUES (
    current_user_id,
    current_user_email,
    null,
    'member',
    now()
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;