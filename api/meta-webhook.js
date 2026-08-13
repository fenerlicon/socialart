export default async function handler(req, res) {
  // 1. Meta Webhook Dogrulama (GET istegi)
  if (req.method === 'GET') {
    const hubMode = req.query['hub.mode'];
    const hubChallenge = req.query['hub.challenge'];
    const hubVerifyToken = req.query['hub.verify_token'];

    // Webhook dogrulama sifresi
    if (hubMode === 'subscribe' && (hubVerifyToken === 'socialart_meta_secret_2026' || hubVerifyToken === 'socialart_crm_2026')) {
      return res.status(200).send(hubChallenge);
    }
    return res.status(403).send('Verification failed');
  }

  // 2. Meta Lead Verisi Gelince (POST istegi)
  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log('FB_LEAD_DATA_RECEIVED:', JSON.stringify(body));

      const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://piffaggeshfrubyjkhej.supabase.co';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2OTMzMSwiZXhwIjoyMDk0MzQ1MzMxfQ.DT3n6RNiwA_Tr_xt9iHRqWpDH718lFamct9tAXG8E2w';
      const metaAccessToken = process.env.META_PAGE_ACCESS_TOKEN || 'EAALZAYfbO0yQBSIuujz8eZC4rOCFWpX20ZAkrV3HobY86LZCZAb9cPqw7EiPdaGTsVZA0bFxheXlPyL2tSbj2EgKmvG7JF4ZAAxx6UuLHZAvMGaX4VzxPZCCYADD5JjqZBp1yZCSp5UBSx9ed8UoPeflxHi2xUkQtXmKyX1m0ZAIilc8k19VdLaFTMLa07T5meU4egZDZD';

      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const messaging = entry?.messaging?.[0];

      let newLead = null;

      // A: LEAD FORM GELINCE
      if (change?.value?.leadgen_id) {
        const leadgenId = change.value.leadgen_id;
        const rawAdId = change.value.ad_id ? String(change.value.ad_id) : null;
        const rawAdsetId = (change.value.adset_id || change.value.adgroup_id) ? String(change.value.adset_id || change.value.adgroup_id) : null;
        const rawCampaignId = change.value.campaign_id ? String(change.value.campaign_id) : null;

        let fullName = change.value.full_name || change.value.name || '';
        let phoneNumber = change.value.phone_number || change.value.phone || '';
        let emailAddress = change.value.email || '';
        let companyName = '';
        let serviceAnswer = '';
        let dynamicNotes = [];

        let realCampaignName = change.value.campaign_name || null;
        let realCampaignId = rawCampaignId;
        let realAdsetName = change.value.adset_name || null;
        let realAdsetId = rawAdsetId;
        let realAdName = change.value.ad_name || null;
        let realAdId = rawAdId;

        // Eger Meta Access Token varsa, Meta Graph API'den tam veriyi ve gercek reklam isimlerini cek
        if (metaAccessToken) {
          try {
            // 1. Leadgen Detaylarini Cek (Musteri Ad, Telefon, Mail, Form Cevaplari)
            const leadRes = await fetch(`https://graph.facebook.com/v19.0/${leadgenId}?access_token=${metaAccessToken}`);
            if (leadRes.ok) {
              const leadData = await leadRes.json();
              console.log('META_GRAPH_LEAD_DATA:', JSON.stringify(leadData));

              if (Array.isArray(leadData.field_data)) {
                leadData.field_data.forEach(field => {
                  const fieldName = (field.name || '').toLowerCase();
                  const fieldValue = Array.isArray(field.values) ? field.values[0] : field.values;

                  if (!fieldValue) return;

                  if (fieldName.includes('full_name') || fieldName.includes('name') || fieldName.includes('ad_soyad')) {
                    fullName = fieldValue;
                  } else if (fieldName.includes('phone') || fieldName.includes('tel')) {
                    phoneNumber = fieldValue;
                  } else if (fieldName.includes('email') || fieldName.includes('e_mail')) {
                    emailAddress = fieldValue;
                  } else if (fieldName.includes('company') || fieldName.includes('sirket') || fieldName.includes('firma')) {
                    companyName = fieldValue;
                  } else if (fieldName.includes('service') || fieldName.includes('hizmet') || fieldName.includes('talep')) {
                    serviceAnswer = fieldValue;
                  } else {
                    dynamicNotes.push(`${field.name}: ${fieldValue}`);
                  }
                });
              }

              if (leadData.ad_id && !realAdId) realAdId = String(leadData.ad_id);
              if (leadData.adset_id && !realAdsetId) realAdsetId = String(leadData.adset_id);
              if (leadData.campaign_id && !realCampaignId) realCampaignId = String(leadData.campaign_id);
            }
          } catch (graphErr) {
            console.error('GRAPH_API_LEAD_FETCH_ERROR:', graphErr.message);
          }

          // 2. Ad Detaylarini Cek (Gercek Kampanya, AdSet ve Kreatif Isimleri)
          if (realAdId) {
            try {
              const adRes = await fetch(`https://graph.facebook.com/v19.0/${realAdId}?fields=name,adset{id,name},campaign{id,name}&access_token=${metaAccessToken}`);
              if (adRes.ok) {
                const adData = await adRes.json();
                console.log('META_GRAPH_AD_DATA:', JSON.stringify(adData));

                realAdName = adData.name || realAdName;
                if (adData.adset) {
                  realAdsetName = adData.adset.name || realAdsetName;
                  realAdsetId = adData.adset.id ? String(adData.adset.id) : realAdsetId;
                }
                if (adData.campaign) {
                  realCampaignName = adData.campaign.name || realCampaignName;
                  realCampaignId = adData.campaign.id ? String(adData.campaign.id) : realCampaignId;
                }
              }
            } catch (adGraphErr) {
              console.error('GRAPH_API_AD_FETCH_ERROR:', adGraphErr.message);
            }
          }
        }

        const leadTitle = companyName && companyName.trim()
          ? `${fullName || 'Yeni Müşteri'} | ${companyName.trim()}`
          : (fullName || `[FORM] Yeni Meta Reklam Lead'i`);

        const reactionText = `Meta Lead Formu dolduruldu.${companyName ? ` Şirket: ${companyName}` : ''}${serviceAnswer ? ` | Talep: ${serviceAnswer}` : ''}`;

        newLead = {
          name: leadTitle,
          title: companyName || null,
          phone: phoneNumber,
          email: emailAddress,
          service: serviceAnswer || 'Meta Reklam Formu',
          status: 'Yeni',
          stage: 'NEW',
          campaign_id: realCampaignId,
          campaign_name: realCampaignName,
          adset_id: realAdsetId,
          adset_name: realAdsetName,
          ad_id: realAdId,
          ad_name: realAdName,
          is_organic: Boolean(change.value.is_organic),
          reaction: reactionText,
          platform: 'Meta Ads (Instagram)',
          notes: dynamicNotes.length > 0 ? [{
            id: `note-${Date.now()}`,
            author: 'Meta Form',
            text: dynamicNotes.join(' | '),
            createdAt: new Date().toISOString()
          }] : []
        };
      } 
      
      // B: INSTAGRAM DM GELINCE
      else if (messaging?.message) {
        const msgText = messaging.message.text;
        newLead = {
          name: `[DM] Potansiyel Müşteri`,
          service: 'Instagram Mesajı',
          status: 'Yeni',
          stage: 'NEW',
          is_organic: true,
          reaction: `Mesaj: ${msgText}`,
          platform: 'Instagram'
        };
      }

      if (newLead) {
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

        if (!insertRes.ok) {
          const errBody = await insertRes.text();
          throw new Error(`Supabase insert failed: ${errBody}`);
        }
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('SERVER_ERROR:', error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  return res.status(405).send('Method not allowed');
}
