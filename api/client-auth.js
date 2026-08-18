// Serverless Client Portal Authentication Handler
const CLIENT_ACCOUNTS_MAP = {
  arayanvar: { id: 'c-arayanvar', company_code: 'arayanvar', client_name: 'Arayanvar / Aryanvar', password: process.env.CLIENT_PASS_ARAYANVAR || 'SOC-QVGR', defaultTab: 'billing_support' },
  aryanvar: { id: 'c-aryanvar', company_code: 'aryanvar', client_name: 'Arayanvar / Aryanvar', password: process.env.CLIENT_PASS_ARYANVAR || 'SOC-QVGR', defaultTab: 'billing_support' },
  mallofgurme: { id: 'c-mallofgurme', company_code: 'mallofgurme', client_name: 'Mall Of Gurme', password: process.env.CLIENT_PASS_MALLOFGURME || 'SOC-ZMLP', defaultTab: 'overview_ads' },
  miocasa: { id: 'c-miocasa', company_code: 'miocasa', client_name: 'MioCasa', password: process.env.CLIENT_PASS_MIOCASA || 'SOC-94G3', defaultTab: 'overview_ads' },
  shineco: { id: 'c-shineco', company_code: 'shineco', client_name: 'Shineco', password: process.env.CLIENT_PASS_SHINECO || 'SOC-XNCL', defaultTab: 'overview_ads' },
  gurme: { id: 'c-gurme', company_code: 'gurme', client_name: 'Gurme Bahçeşehir', password: process.env.CLIENT_PASS_GURME || 'SOC-QB2L', defaultTab: 'overview_ads' },
  ogena: { id: 'c-ogena', company_code: 'ogena', client_name: 'Ogena Yapı', password: process.env.CLIENT_PASS_OGENA || 'SOC-X6QN', defaultTab: 'billing_support' },
  vipcatring: { id: 'c-vipcatring', company_code: 'vipcatring', client_name: 'VIP Catring', password: process.env.CLIENT_PASS_VIPCATRING || 'SOC-8WGK', defaultTab: 'billing_support' },
  postprodart: { id: 'c-postprodart', company_code: 'postprodart', client_name: 'Postprodart', password: process.env.CLIENT_PASS_POSTPRODART || 'SOC-X6CL', defaultTab: 'billing_support' },
  demo: { id: 'c-demo', company_code: 'demo', client_name: 'SocialArt VIP Demo', password: process.env.CLIENT_PASS_DEMO || 'SOC-WKX7', defaultTab: 'overview_ads' }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, password } = req.body || {};
  const cleanCode = String(code || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const cleanPass = String(password || '').trim();

  if (!cleanCode || !cleanPass) {
    return res.status(400).json({ error: 'Şirket kodu ve şifre zorunludur.' });
  }

  const account = CLIENT_ACCOUNTS_MAP[cleanCode];

  if (!account || account.password !== cleanPass) {
    return res.status(401).json({ error: 'Girdiğiniz şirket kodu veya erişim şifresi hatalı.' });
  }

  const safeProfile = {
    id: account.id,
    company_code: account.company_code,
    client_name: account.client_name,
    defaultTab: account.defaultTab
  };

  return res.status(200).json({
    success: true,
    customer: safeProfile
  });
}