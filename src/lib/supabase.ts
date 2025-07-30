import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmlazamhxmvtbcuxnobq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbGF6YW1oeG12dGJjdXhub2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjcwMjgsImV4cCI6MjA2ODQwMzAyOH0.Mi3i9wt7VT0OmYcFi5qF6YL7Fh80qg5bClWvka3LtGk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Ensure the job-postings bucket exists
const ensureBucketExists = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    
    const bucketExists = buckets.some(bucket => bucket.name === 'job-postings');
    
    if (!bucketExists) {
      console.warn('Job postings bucket does not exist. Please create a bucket named "job-postings" in your Supabase Storage.');
    }
  } catch (error) {
    console.error('Error checking for job-postings bucket:', error);
  }
};

// Run the check when the module loads
ensureBucketExists().catch(console.error);
