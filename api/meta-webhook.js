export default async function handler(req, res) {
  // 1. Meta Webhook Dogrulama (GET istegi)
  if (req.method === 'GET') {
    const hubMode = req.query['hub.mode'];
    const hubChallenge = req.query['hub.challenge'];
    const hubVerifyToken = req.query['hub.verify_token'];

    // Sizin icin belirledigim guvenlik sifresi: socialart_meta_secret_2026
    if (hubMode === 'subscribe' && hubVerifyToken === 'socialart_meta_secret_2026') {
      return res.status(200).send(hubChallenge);
    }
    return res.status(403).send('Verification failed');
  }

  // 2. Meta Lead Verisi Gelince (POST istegi)
  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log('FB_LEAD_DATA:', JSON.stringify(body));

      // Supabase'e baglanip veriyi kaydetmek icin gerekli env verileri
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; 

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase env variables are missing');
      }

      // Veriyi ayikla
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const messaging = entry?.messaging?.[0];

      let newLead = null;

      // A: LEAD FORM GELINCE
      if (change?.value?.leadgen_id) {
        newLead = {
          name: `[FORM] Yeni Reklam Lead'i`,
          service: 'Meta Reklam Formu',
          status: 'Yeni',
          reaction: `Lead ID: ${change.value.leadgen_id} | Form ID: ${change.value.form_id}`,
          platform: 'Meta'
        };
      } 
      
      // B: INSTAGRAM DM GELINCE
      else if (messaging?.message) {
        const msgText = messaging.message.text;
        newLead = {
          name: `[DM] Potansiyel Müşteri`,
          service: 'Instagram Mesajı',
          status: 'Yeni',
          reaction: `Mesaj: ${msgText}`,
          platform: 'Instagram'
        };
      }

      if (newLead) {
        // Fetch ile Supabase'e basit bir POST
        const insertRes = await fetch(`${supabaseUrl}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(newLead)
        });

        if (!insertRes.ok) throw new Error('Supabase insert failed');
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('SERVER_ERROR:', error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  return res.status(405).send('Method not allowed');
}
