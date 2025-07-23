import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if user is a company
    const { data: userData, error: userDataError } = await supabaseClient
      .from('users')
      .select('role, email_verified')
      .eq('id', user.id)
      .single()

    if (userDataError || !userData || userData.role !== 'company') {
      return new Response(JSON.stringify({ error: 'Not a company user' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // If already verified, return success
    if (userData.email_verified) {
      return new Response(JSON.stringify({ message: 'Email already verified' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    
    // Create verification token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .rpc('create_email_verification_token', { user_id: user.id })

    if (tokenError) throw tokenError

    // Send verification email
    const verificationLink = `${Deno.env.get('SITE_URL')}/api/verify-email?token=${tokenData}`
    
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: user.email!,
      subject: 'Verify Your Company Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Our Platform!</h2>
          <p>Thank you for signing up as a company. Please verify your email address to get started.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationLink}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${verificationLink}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    })

    if (emailError) {
      console.error('Email sending failed:', emailError)
      throw new Error('Failed to send verification email')
    }

    return new Response(
      JSON.stringify({ message: 'Verification email sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
