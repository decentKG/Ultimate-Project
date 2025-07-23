-- Create a table to store email verification tokens
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(token)
);

-- Enable RLS on the tokens table
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON public.email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON public.email_verification_tokens(user_id);

-- Function to create a new verification token
CREATE OR REPLACE FUNCTION public.create_email_verification_token(user_id UUID)
RETURNS TEXT SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  new_token TEXT;
BEGIN
  -- Delete any existing tokens for this user
  DELETE FROM public.email_verification_tokens
  WHERE user_id = create_email_verification_token.user_id;
  
  -- Generate a secure random token
  SELECT encode(gen_random_bytes(32), 'hex') INTO new_token;
  
  -- Insert the new token
  INSERT INTO public.email_verification_tokens (user_id, token)
  VALUES (create_email_verification_token.user_id, new_token);
  
  RETURN new_token;
END;
$$;

-- Function to verify an email token
CREATE OR REPLACE FUNCTION public.verify_email_token(token_to_verify TEXT)
RETURNS TABLE(user_id UUID) SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.email_verification_tokens
  SET used = TRUE
  WHERE 
    token = token_to_verify
    AND used = FALSE
    AND expires_at > NOW()
  RETURNING user_id;
  
  -- Clean up expired tokens (runs asynchronously)
  PERFORM pg_notify('cleanup_tokens', '');
END;
$$;

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS VOID SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.email_verification_tokens
  WHERE expires_at < NOW();
END;
$$;

-- Set up a trigger to clean up tokens periodically
CREATE OR REPLACE FUNCTION public.cleanup_tokens_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.cleanup_expired_tokens();
  RETURN NULL;
END;
$$;

-- Create a trigger that listens for the cleanup event
CREATE OR REPLACE FUNCTION public.cleanup_tokens_listener()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- This function is called by the trigger
  -- It's a no-op, just needed for the trigger
END;
$$;

-- Set up RLS policies for the tokens table
CREATE POLICY "Users can view their own tokens"
  ON public.email_verification_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all tokens"
  ON public.email_verification_tokens
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create a trigger to clean up tokens when they're used or expired
CREATE TRIGGER cleanup_tokens_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.email_verification_tokens
  EXECUTE FUNCTION public.cleanup_tokens_trigger();

-- Create a function to check if a user is verified
CREATE OR REPLACE FUNCTION public.is_user_verified(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = user_id AND email_verified = TRUE
  );
$$;
