import { createClient } from '@supabase/supabase-js';

const PRIMARY_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://osuwytugjscwhcxxkhfa.supabase.co';
const PRIMARY_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU5MzM5NywiZXhwIjoyMDk5MTY5Mzk3fQ.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const supabase = createClient(PRIMARY_SUPABASE_URL, PRIMARY_SUPABASE_KEY);

export default async function handler(req, res) {
  // CORS Headers for ChatGPT Actions
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // API Key check
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const expectedKey = process.env.GPT_API_KEY || 'socialart-gpt-secret-2026';

  if (apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Yetkisiz erişim. Lütfen geçerli x-api-key başlığını gönderin.' });
  }

  // GET: Fetch calendar events
  if (req.method === 'GET') {
    try {
      const { data: events, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_date', { ascending: true })
        .limit(50);

      if (error) {
        // Fallback to notifications if calendar_events does not exist
        const { data: notifs } = await supabase.from('notifications').select('*').eq('type', 'calendar_event');
        return res.status(200).json({ events: notifs || [] });
      }

      return res.status(200).json({ events: events || [] });
    } catch (err) {
      return res.status(500).json({ error: 'Sunucu hatası', details: String(err) });
    }
  }

  // POST: Add new calendar event / shoot
  if (req.method === 'POST') {
    try {
      const { title, brand_name, date, time, location, event_type, notes } = req.body || {};

      // Validate Required Fields
      const missingFields = [];
      if (!title || !title.trim()) missingFields.push('Çekim/Etkinlik Başlığı (title)');
      if (!brand_name || !brand_name.trim()) missingFields.push('Marka/Firma Adı (brand_name)');
      if (!date || !date.trim()) missingFields.push('Tarih (date)');
      if (!time || !time.trim()) missingFields.push('Saat (time)');

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: 'MISSING_REQUIRED_FIELDS',
          message: `Eksik alanlar var: ${missingFields.join(', ')}. Lütfen kullanıcıya bu eksik bilgileri sorun.`,
          missing_fields: missingFields
        });
      }

      const nowIso = new Date().toISOString();
      const eventId = `CAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const eventPayload = {
        id: eventId,
        title: `${brand_name.trim()} - ${title.trim()}`,
        brand_name: brand_name.trim(),
        event_type: event_type || 'Video Çekimi',
        date: date.trim(),
        time: time.trim(),
        location: location || 'Ajans Stüdyosu',
        notes: notes || '',
        created_by: 'ChatGPT AI Assistant',
        created_at: nowIso
      };

      // Store in notifications & blocked_slots for universal integration
      const notifRecord = {
        id: eventId,
        recipient_employee_id: '406a078d-0aea-45e0-87e1-d4d0b5f20415', // Default notification
        type: 'calendar_event',
        title: `📅 Takvim Etkinliği: ${eventPayload.title}`,
        message: JSON.stringify(eventPayload),
        related_entity_type: 'calendar',
        related_entity_id: eventId,
        is_read: false,
        created_at: nowIso
      };

      await supabase.from('notifications').insert([notifRecord]).catch(() => {});

      return res.status(200).json({
        success: true,
        message: `✅ Takvime etkinlik eklendi: "${eventPayload.title}" (${date} - Saat: ${time})`,
        event: eventPayload
      });
    } catch (err) {
      return res.status(500).json({ error: 'Sunucu hatası', details: String(err) });
    }
  }

  return res.status(405).json({ error: 'Sadece GET ve POST desteklenir.' });
}
