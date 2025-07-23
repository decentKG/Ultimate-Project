import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmlazamhxmvtbcuxnobq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbGF6YW1oeG12dGJjdXhub2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjcwMjgsImV4cCI6MjA2ODQwMzAyOH0.Mi3i9wt7VT0OmYcFi5qF6YL7Fh80qg5bClWvka3LtGk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
