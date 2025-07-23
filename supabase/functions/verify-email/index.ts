import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return new Response(JSON.stringify({ error: 'Verification token is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create a Supabase client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the token and get user ID
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .rpc('verify_email_token', { token })

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ 
        error: 'Invalid or expired verification token' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = tokenData.user_id

    // Update user's email_verified status
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ email_verified: true })
      .eq('id', userId)

    if (updateError) throw updateError

    // Invalidate the used token
    await supabaseAdmin
      .from('email_verification_tokens')
      .delete()
      .eq('token', token)

    // Return success response with redirect HTML
    const successHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified</title>
        <meta http-equiv="refresh" content="5;url=${Deno.env.get('SITE_URL')}/company-dashboard" />
        <style>
          body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            background-color: #f5f5f5;
          }
          .container { 
            text-align: center; 
            padding: 2rem; 
            background: white; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 90%;
          }
          .success-icon {
            color: #10B981;
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          h1 { 
            color: #1F2937; 
            margin-bottom: 1rem;
          }
          p { 
            color: #4B5563; 
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          .redirect-message {
            color: #6B7280;
            font-size: 0.9rem;
            margin-top: 2rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✓</div>
          <h1>Email Verified Successfully!</h1>
          <p>Thank you for verifying your email address. You're all set to start using our platform.</p>
          <p>You'll be redirected to your dashboard shortly.</p>
          <div class="redirect-message">
            If you're not redirected, <a href="${Deno.env.get('SITE_URL')}/company-dashboard">click here</a>.
          </div>
        </div>
      </body>
      </html>
    `

    return new Response(successHtml, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Error verifying email:', error)
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verification Failed</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            background-color: #f5f5f5;
          }
          .container { 
            text-align: center; 
            padding: 2rem; 
            background: white; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 90%;
          }
          .error-icon {
            color: #EF4444;
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          h1 { 
            color: #1F2937; 
            margin-bottom: 1rem;
          }
          p { 
            color: #4B5563; 
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          .support {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #E5E7EB;
            color: #6B7280;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">✕</div>
          <h1>Verification Failed</h1>
          <p>We couldn't verify your email address. The verification link may have expired or is invalid.</p>
          <p>Please try signing in to request a new verification email or contact support if the issue persists.</p>
          <div class="support">
            Need help? <a href="mailto:support@yourdomain.com">Contact Support</a>
          </div>
        </div>
      </body>
      </html>
    `

    return new Response(errorHtml, {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
      },
    })
  }
})
