import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const { method } = req
  const url = new URL(req.url)

  // 1. Meta Webhook Verification (Challenge)
  if (method === 'GET') {
    const hubMode = url.searchParams.get('hub.mode')
    const hubChallenge = url.searchParams.get('hub.challenge')
    const hubVerifyToken = url.searchParams.get('hub.verify_token')

    if (hubMode === 'subscribe' && hubVerifyToken === 'socialart_meta_secret_2026') {
      return new Response(hubChallenge, { status: 200 })
    }
    return new Response('Verification failed', { status: 403 })
  }

  // 2. Meta Webhook Data Reception (Formlar + Mesajlar)
  if (method === 'POST') {
    try {
      const body = await req.json()
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      console.log('FB_FULL_DATA:', JSON.stringify(body))

      const entry = body.entry?.[0]
      const change = entry?.changes?.[0]
      const messaging = entry?.messaging?.[0] // Mesajlar buradan gelir
      
      let newLead = null;

      // A: LEAD FORM GELINCE
      if (change?.value?.leadgen_id) {
        newLead = {
          name: `[FORM] Yeni Reklam Müşterisi`,
          service: 'Meta Reklam Formu',
          status: 'Yeni',
          reaction: `Lead ID: ${change.value.leadgen_id}\nForm ID: ${change.value.form_id}`,
          platform: 'Meta'
        };
      } 
      
      // B: INSTAGRAM DM GELINCE
      else if (messaging?.message) {
        const senderId = messaging.sender.id;
        const msgText = messaging.message.text;
        newLead = {
          name: `[DM] Potansiyel Müşteri`,
          service: 'Instagram Mesajı',
          status: 'Yeni',
          reaction: `Mesaj: ${msgText}\nSender ID: ${senderId}`,
          platform: 'Instagram'
        };
      }

      if (newLead) {
        await supabase.from('leads').insert([newLead]);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
  }

  return new Response('Method not allowed', { status: 405 })
})
