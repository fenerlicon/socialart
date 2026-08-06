import Iyzipay from 'iyzipay';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const token = req.body?.token;

  const host = req.headers.host || 'www.socialartmedya.com';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const siteUrl = process.env.VITE_SITE_URL || `${protocol}://${host}`;

  if (!token) {
    return res.redirect(302, `${siteUrl}/tesekkurler?payment=failed&reason=${encodeURIComponent('Güvenlik tokenı bulunamadı')}`);
  }

  const rawApiKey = process.env.IYZICO_API_KEY;
  const rawSecretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl = process.env.IYZICO_BASE_URL || 'https://api.iyzipay.com';

  const iyzipay = new Iyzipay({
    apiKey: rawApiKey,
    secretKey: rawSecretKey,
    uri: baseUrl
  });

  iyzipay.checkoutForm.retrieve({ locale: Iyzipay.LOCALE.TR, token }, async (err, result) => {
    if (err || !result || result.status !== 'success' || result.paymentStatus !== 'SUCCESS') {
      const errorMsg = encodeURIComponent(result?.errorMessage || 'Ödeme işlemi onaylanmadı veya iptal edildi.');
      return res.redirect(302, `${siteUrl}/tesekkurler?payment=failed&reason=${errorMsg}`);
    }

    // Payment Verified Successfully!
    const paymentId = result.paymentId;
    const paidPrice = result.paidPrice || result.price;
    const buyerEmail = result.buyer?.email || '';
    const buyerName = `${result.buyer?.name || ''} ${result.buyer?.surname || ''}`.trim();
    const buyerPhone = result.buyer?.gsmNumber || '';
    const basketItemName = result.basketItems?.[0]?.name || 'Hizmet Paketi';

    // Log to Supabase DB if accessible
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('leads').insert([{
          name: buyerName,
          email: buyerEmail,
          phone: buyerPhone,
          service: `[ÖDEME ALINDI] ${basketItemName}`,
          status: 'Anlaşıldı',
          stage: 'WON',
          budget: Number(paidPrice) || 0,
          reaction: `iyzico Online Ödeme Alındı! Tutar: ₺${paidPrice} (Ödeme ID: ${paymentId})`,
          created_at: new Date().toISOString()
        }]);
      } catch (e) {
        console.warn('Supabase iyzico log error:', e);
      }
    }

    // Redirect user to ThankYou page with payment success state
    return res.redirect(302, `${siteUrl}/tesekkurler?payment=success&paymentId=${paymentId}&amount=${paidPrice}&name=${encodeURIComponent(buyerName)}&plan=${encodeURIComponent(basketItemName)}`);
  });
}
