// In-memory cache to prevent Meta API rate limits
let cachedInsights = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 25000; // 25 seconds cache

export default async function handler(req, res) {
  // CORS Headers - Limit or allow same-origin
  const origin = req.headers.origin || '';
  const allowedOrigins = ['https://socialartajans.com', 'https://www.socialartajans.com', 'https://socialart.com.tr', 'https://www.socialart.com.tr', 'http://localhost:5173', 'http://localhost:3000'];
  
  if (allowedOrigins.some(o => origin.startsWith(o)) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://socialart.com.tr');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const now = Date.now();
  const datePreset = req.query.date_preset || 'this_month';

  // Return cached result if fresh
  if (cachedInsights && (now - lastCacheTime < CACHE_TTL_MS) && datePreset === 'this_month') {
    return res.status(200).json({
      success: true,
      data: cachedInsights,
      cached: true
    });
  }

  try {
    const metaAccessToken = process.env.META_PAGE_ACCESS_TOKEN || 'EAALZAYfbO0yQBSIuujz8eZC4rOCFWpX20ZAkrV3HobY86LZCZAb9cPqw7EiPdaGTsVZA0bFxheXlPyL2tSbj2EgKmvG7JF4ZAAxx6UuLHZAvMGaX4VzxPZCCYADD5JjqZBp1yZCSp5UBSx9ed8UoPeflxHi2xUkQtXmKyX1m0ZAIilc8k19VdLaFTMLa07T5meU4egZDZD';
    const accountId = process.env.META_AD_ACCOUNT_ID || 'act_1173496391102992';

    // 1. Today Spend
    const todayRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/insights?date_preset=today&fields=spend,impressions,clicks,cpc,cpm,reach&access_token=${metaAccessToken}`);
    const todayData = await todayRes.json();
    const todaySpend = parseFloat(todayData.data?.[0]?.spend || '0');

    // 2. Month / Selected Preset Total Spend
    const totalRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/insights?date_preset=${datePreset}&fields=spend,impressions,clicks,cpc,cpm,reach&access_token=${metaAccessToken}`);
    const totalData = await totalRes.json();
    const totalSpend = parseFloat(totalData.data?.[0]?.spend || '0');
    const impressions = parseInt(totalData.data?.[0]?.impressions || '0', 10);
    const clicks = parseInt(totalData.data?.[0]?.clicks || '0', 10);
    const reach = parseInt(totalData.data?.[0]?.reach || '0', 10);
    const cpc = parseFloat(totalData.data?.[0]?.cpc || '0');

    // 3. Campaign Breakdown Spend
    const campRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/insights?level=campaign&date_preset=${datePreset}&fields=campaign_id,campaign_name,spend,impressions,clicks&limit=50&access_token=${metaAccessToken}`);
    const campData = await campRes.json();
    const campaignSpends = {};
    (campData.data || []).forEach(c => {
      campaignSpends[c.campaign_name] = parseFloat(c.spend || '0');
      if (c.campaign_id) campaignSpends[c.campaign_id] = parseFloat(c.spend || '0');
    });

    // 4. Adset Breakdown Spend
    const adsetRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/insights?level=adset&date_preset=${datePreset}&fields=adset_id,adset_name,spend,impressions,clicks&limit=50&access_token=${metaAccessToken}`);
    const adsetData = await adsetRes.json();
    const adsetSpends = {};
    (adsetData.data || []).forEach(s => {
      adsetSpends[s.adset_name] = parseFloat(s.spend || '0');
      if (s.adset_id) adsetSpends[s.adset_id] = parseFloat(s.spend || '0');
    });

    // 5. Ad Breakdown Spend
    const adRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/insights?level=ad&date_preset=${datePreset}&fields=ad_id,ad_name,spend,impressions,clicks&limit=50&access_token=${metaAccessToken}`);
    const adData = await adRes.json();
    const adSpends = {};
    (adData.data || []).forEach(a => {
      adSpends[a.ad_name] = parseFloat(a.spend || '0');
      if (a.ad_id) adSpends[a.ad_id] = parseFloat(a.spend || '0');
    });

    const result = {
      todaySpend,
      totalSpend,
      impressions,
      clicks,
      reach,
      cpc,
      campaignSpends,
      adsetSpends,
      adSpends,
      updatedAt: new Date().toISOString()
    };

    if (datePreset === 'this_month') {
      cachedInsights = result;
      lastCacheTime = now;
    }

    return res.status(200).json({
      success: true,
      data: result,
      cached: false
    });
  } catch (error) {
    console.error('META_INSIGHTS_API_ERROR:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
