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
    const conversationId = result.conversationId || '';

    // Check if this payment is for an existing customer's custom payment request/invoice
    const isCustomInvoice = conversationId.startsWith('SOC_INV_');
    const invoiceMatch = conversationId.match(/^SOC_INV_([^_]+)/);
    const extractedRequestId = (invoiceMatch && invoiceMatch[1] !== 'custom') ? invoiceMatch[1] : null;

    const PRIMARY_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://osuwytugjscwhcxxkhfa.supabase.co';
    const PRIMARY_SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

    const LEADS_SUPABASE_URL = process.env.LEADS_SUPABASE_URL || 'https://piffaggeshfrubyjkhej.supabase.co';
    const LEADS_SUPABASE_KEY = process.env.LEADS_SUPABASE_SERVICE_KEY || process.env.LEADS_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2OTMzMSwiZXhwIjoyMDk0MzQ1MzMxfQ.DT3n6RNiwA_Tr_xt9iHRqWpDH718lFamct9tAXG8E2w';

    if (isCustomInvoice) {
      // 1. EXISTING CLIENT INVOICE: Update payment status & notify agency team (DO NOT add as a new CRM lead)
      try {
        const supabasePrimary = createClient(PRIMARY_SUPABASE_URL, PRIMARY_SUPABASE_KEY);

        // Update payment_requests table
        if (extractedRequestId) {
          await supabasePrimary.from('payment_requests').update({
            status: 'paid',
            updated_at: new Date().toISOString()
          }).eq('id', extractedRequestId);

          try {
            await supabasePrimary.from('client_payment_requests').update({
              status: 'paid'
            }).eq('id', extractedRequestId);
          } catch (e) {}
        } else if (buyerName) {
          await supabasePrimary.from('payment_requests').update({
            status: 'paid',
            updated_at: new Date().toISOString()
          }).ilike('client_name', `%${buyerName}%`);
        }

        // Add Notification for Staff
        await supabasePrimary.from('notifications').insert([{
          id: `NOTIF-PAY-${Date.now()}`,
          type: 'payment_received',
          title: `💰 Ödeme Alındı: ${buyerName || 'Müşteri'} (₺${Number(paidPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })})`,
          message: `${buyerName || 'Müşteri'} müşterisinin "${basketItemName}" ödeme talebi iyzico ile tahsil edildi. (Ödeme ID: ${paymentId})`,
          related_entity_type: 'payment',
          related_entity_id: extractedRequestId || 'payment',
          is_read: false,
          created_at: new Date().toISOString()
        }]);

        // Log into Activity Log
        await supabasePrimary.from('activity_log').insert([{
          target_name: buyerName || 'Müşteri',
          action: 'Ödeme Alındı',
          details: `₺${Number(paidPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} tutarındaki "${basketItemName}" ödemesi iyzico ile tamamlandı. (Ödeme ID: ${paymentId})`,
          created_at: new Date().toISOString()
        }]);
      } catch (e) {
        console.warn('Supabase custom payment update error:', e);
      }
    } else {
      // 2. DIRECT WEBSITE PACKAGE PURCHASE: Create New Won Lead in CRM
      try {
        const supabaseLeads = createClient(LEADS_SUPABASE_URL, LEADS_SUPABASE_KEY);
        const formattedDate = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

        await supabaseLeads.from('leads').insert([{
          name: buyerName || 'Web Sitesi Müşterisi',
          email: buyerEmail,
          phone: buyerPhone,
          service: `[ONLİNE SATIŞ] ${basketItemName}`,
          platform: 'Web Sitesi (Doğrudan Satış)',
          status: 'Anlaşıldı',
          stage: 'WON',
          budget: Number(paidPrice) || 0,
          reaction: `Web sitesi üzerinden doğrudan paket satın alındı! Tutar: ₺${paidPrice} (iyzico ID: ${paymentId})`,
          date: formattedDate,
          created_at: new Date().toISOString()
        }]);
      } catch (e) {
        console.warn('Supabase website lead log error:', e);
      }
    }

    // Redirect user to ThankYou page with payment success state
    return res.redirect(302, `${siteUrl}/tesekkurler?payment=success&paymentId=${paymentId}&amount=${paidPrice}&name=${encodeURIComponent(buyerName)}&plan=${encodeURIComponent(basketItemName)}`);
  });
}
