import creativeProductionHandler from './_lib/creative-production-handler.js';

export default async function handler(req, res) {
  try {
    return await creativeProductionHandler(req, res);
  } catch (err) {
    if (!res.headersSent && typeof res.status === 'function') {
      return res.status(500).json({ error: 'Internal server error in creative production' });
    }
  }
}
