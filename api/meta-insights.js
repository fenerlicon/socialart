const MASTER_TOKEN = process.env.META_PAGE_ACCESS_TOKEN || process.env.META_MASTER_TOKEN || '';

const BRAND_META_CONFIGS = {
  mallofgurme: {
    accountId: process.env.META_ACCOUNT_MALLOFGURME || 'act_1623202645011162',
    token: process.env.META_TOKEN_MALLOFGURME || MASTER_TOKEN
  },
  gurme: {
    accountId: process.env.META_ACCOUNT_GURME || 'act_289754769812729',
    token: process.env.META_TOKEN_GURME || MASTER_TOKEN
  },
  shineco: {
    accountId: process.env.META_ACCOUNT_SHINECO || 'act_1608208866017447',
    token: process.env.META_TOKEN_SHINECO || MASTER_TOKEN
  },
  miocasa: {
    accountId: process.env.META_ACCOUNT_MIOCASA || 'act_521331138335695',
    token: process.env.META_TOKEN_MIOCASA || MASTER_TOKEN
  },
  postprodart: {
    accountId: process.env.META_ACCOUNT_POSTPRODART || 'act_1341032947601781',
    token: process.env.META_TOKEN_POSTPRODART || MASTER_TOKEN
  }
};

const cache = {};
const CACHE_TTL_MS = 30000; // 30 seconds

export default async function handler(req, res) {
  // CORS Headers
  const origin = req.headers.origin || '';
  const allowedOrigins = ['https://socialartajans.com', 'https://www.socialartajans.com', 'https://socialartmedya.com', 'https://www.socialartmedya.com', 'https://socialart.com.tr', 'http://localhost:5173', 'http://localhost:3000'];
  
  if (allowedOrigins.some(o => origin.startsWith(o)) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
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

  const companyCode = (req.query.company_code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const datePreset = req.query.date_preset || 'last_30d';

  // Check if this brand has a registered Meta Ad Account
  const brandMeta = BRAND_META_CONFIGS[companyCode];
  
  const token = brandMeta?.token || MASTER_TOKEN;
  const accountId = brandMeta?.accountId || process.env.META_AD_ACCOUNT_ID || 'act_1623202645011162';

  if (!token) {
    return res.status(503).json({ success: false, error: 'META_SERVICE_UNCONFIGURED' });
  }

  const cacheKey = `${companyCode}_${accountId}_${datePreset}`;
  const now = Date.now();

  if (cache[cacheKey] && (now - cache[cacheKey].timestamp < CACHE_TTL_MS)) {
    return res.status(200).json({
      success: true,
      data: cache[cacheKey].data,
      cached: true
    });
  }

  try {
    // 1. Insights Fetch
    const insRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/insights?date_preset=${datePreset}&fields=spend,impressions,clicks,cpc,cpm,reach,actions&access_token=${token}`);
    const insData = await insRes.json();
    const row = insData.data?.[0] || {};

    const spend = parseFloat(row.spend || '0');
    const impressions = parseInt(row.impressions || '0', 10);
    const clicks = parseInt(row.clicks || '0', 10);
    const reach = parseInt(row.reach || '0', 10);
    const cpc = parseFloat(row.cpc || '0');
    const cpm = parseFloat(row.cpm || '0');

    // 2. Today Spend Fetch
    const todayRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/insights?date_preset=today&fields=spend&access_token=${token}`);
    const todayData = await todayRes.json();
    const todaySpend = parseFloat(todayData.data?.[0]?.spend || '0');

    // 3. Active Ads Fetch
    const adsRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/ads?fields=id,name,status,creative{name,thumbnail_url,title,body}&limit=10&access_token=${token}`);
    const adsData = await adsRes.json();
    const liveAds = (adsData.data || []).map(ad => ({
      id: ad.id,
      name: ad.name,
      status: ad.status,
      thumbnail: ad.creative?.thumbnail_url || null,
      body: ad.creative?.body || ad.creative?.name || '',
      title: ad.creative?.title || ad.name
    }));

    const result = {
      accountId,
      spend,
      todaySpend,
      impressions,
      clicks,
      reach,
      cpc,
      cpm,
      liveAds,
      activeAdsCount: liveAds.filter(a => a.status === 'ACTIVE').length,
      updatedAt: new Date().toISOString()
    };

    cache[cacheKey] = {
      timestamp: now,
      data: result
    };

    return res.status(200).json({
      success: true,
      data: result,
      cached: false
    });
  } catch (err) {
    console.error('Meta Insights API Error:', err);
    return res.status(500).json({
      success: false,
      error: 'İstatistikler alınırken bir sunucu hatası oluştu.'
    });
  }
}
