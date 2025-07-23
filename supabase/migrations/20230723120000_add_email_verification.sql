-- Add email_verified column to auth.users table
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Create or update function to handle email verification
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'company' THEN
    NEW.email_verified := FALSE;
  ELSE
    NEW.email_verified := TRUE; -- Auto-verify non-company users
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle email verification on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_verification();

-- Create policy to allow users to update their own verification status
DROP POLICY IF EXISTS "Users can update their verification status" ON auth.users;
CREATE POLICY "Users can update their verification status"
  ON auth.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
