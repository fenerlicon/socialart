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

    // Log to Supabase DB
    const LEADS_SUPABASE_URL = process.env.LEADS_SUPABASE_URL || 'https://piffaggeshfrubyjkhej.supabase.co';
    const LEADS_SUPABASE_KEY = process.env.LEADS_SUPABASE_SERVICE_KEY || process.env.LEADS_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2OTMzMSwiZXhwIjoyMDk0MzQ1MzMxfQ.DT3n6RNiwA_Tr_xt9iHRqWpDH718lFamct9tAXG8E2w';

    const PRIMARY_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://osuwytugjscwhcxxkhfa.supabase.co';
    const PRIMARY_SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

    try {
      const supabaseLeads = createClient(LEADS_SUPABASE_URL, LEADS_SUPABASE_KEY);
      await supabaseLeads.from('leads').insert([{
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
      console.warn('Supabase iyzico lead log error:', e);
    }

    try {
      const supabasePrimary = createClient(PRIMARY_SUPABASE_URL, PRIMARY_SUPABASE_KEY);
      // Mark any matching payment request as paid
      await supabasePrimary.from('payment_requests').update({
        status: 'paid',
        updated_at: new Date().toISOString()
      }).ilike('client_name', `%${buyerName}%`);
    } catch (e) {
      console.warn('Supabase payment_requests status update error:', e);
    }

    // Redirect user to ThankYou page with payment success state
    return res.redirect(302, `${siteUrl}/tesekkurler?payment=success&paymentId=${paymentId}&amount=${paidPrice}&name=${encodeURIComponent(buyerName)}&plan=${encodeURIComponent(basketItemName)}`);
  });
}
