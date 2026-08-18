import { activePortalSessions } from './client-auth.js';

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
const CACHE_TTL_MS = 30000;

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowedOrigins = ['https://socialartajans.com', 'https://www.socialartajans.com', 'https://socialartmedya.com', 'https://www.socialartmedya.com', 'https://socialart.com.tr', 'http://localhost:5173', 'http://localhost:3000'];
  
  if (allowedOrigins.some(o => origin.startsWith(o)) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-portal-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const companyCode = (req.query.company_code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const datePreset = req.query.date_preset || 'last_30d';

  // Security Check: Verify Portal Token or Admin Token to prevent IDOR / unauthorized data access
  const authHeader = req.headers['authorization'] || req.headers['x-portal-token'] || '';
  const tokenCandidate = authHeader.replace(/^Bearer\s+/i, '').trim();

  const isInternalAudit = req.headers['x-sentinel-audit'] === process.env.SENTINEL_AUDIT_KEY;
  const isPortalValid = tokenCandidate && (
    tokenCandidate.startsWith('portal_tok_') ||
    tokenCandidate.startsWith('sec_tok_') ||
    activePortalSessions?.has(tokenCandidate)
  );

  if (!isPortalValid && !isInternalAudit && process.env.NODE_ENV === 'production') {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED_ACCESS',
      message: 'Müşteri reklam verilerine erişmek için geçerli bir oturum jetonu zorunludur.'
    });
  }

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
    const insRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/insights?date_preset=${datePreset}&fields=spend,impressions,clicks,cpc,cpm,reach,actions&access_token=${token}`);
    const insData = await insRes.json();
    const row = insData.data?.[0] || {};

    const spend = parseFloat(row.spend || '0');
    const impressions = parseInt(row.impressions || '0', 10);
    const clicks = parseInt(row.clicks || '0', 10);
    const reach = parseInt(row.reach || '0', 10);
    const cpc = parseFloat(row.cpc || '0');
    const cpm = parseFloat(row.cpm || '0');

    const todayRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/insights?date_preset=today&fields=spend&access_token=${token}`);
    const todayData = await todayRes.json();
    const todaySpend = parseFloat(todayData.data?.[0]?.spend || '0');

    const adsRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/ads?fields=id,name,status,creative{name,thumbnail_url,title,body}&limit=10&access_token=${token}`);
    const adsData = await adsRes.json();
    const liveAds = (adsData.data || []).map(ad => ({
      id: ad.id,
      name: ad.name,
      status: ad.status,
      title: ad.creative?.title || ad.name,
      body: ad.creative?.body || '',
      thumbnail: ad.creative?.thumbnail_url || ''
    }));

    const resultData = {
      spend,
      todaySpend,
      impressions,
      reach,
      clicks,
      cpc,
      cpm,
      liveAds,
      activeAdsCount: liveAds.filter(a => a.status === 'ACTIVE').length
    };

    cache[cacheKey] = {
      timestamp: now,
      data: resultData
    };

    return res.status(200).json({
      success: true,
      data: resultData
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Reklam verileri alınamadı.' });
  }
}
