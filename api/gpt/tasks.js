import { createClient } from '@supabase/supabase-js';

const PRIMARY_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://osuwytugjscwhcxxkhfa.supabase.co';
const PRIMARY_SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const supabase = createClient(PRIMARY_SUPABASE_URL, PRIMARY_SUPABASE_KEY);

const EMPLOYEE_MAP = {
  furkan: { id: '406a078d-0aea-45e0-87e1-d4d0b5f20415', name: 'Furkan' },
  celal: { id: '26fff081-5502-4624-a71a-b6e4772467c3', name: 'Celal' },
  ercan: { id: '4721de06-0bd6-4681-a2c8-0c0d53da8eaf', name: 'Ercan' },
  simge: { id: '6f2efa88-0600-4d5f-8515-143937b6890f', name: 'Simge' },
  tugba: { id: 'b5e391db-dc21-45a8-baad-19f4073d3b14', name: 'Tuğba' },
  tuğba: { id: 'b5e391db-dc21-45a8-baad-19f4073d3b14', name: 'Tuğba' }
};

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

  // GET: Fetch tasks / notifications
  if (req.method === 'GET') {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        return res.status(500).json({ error: 'Görevler sorgulanırken hata oluştu', details: error.message });
      }

      return res.status(200).json({ tasks: notifications });
    } catch (err) {
      return res.status(500).json({ error: 'Sunucu hatası', details: String(err) });
    }
  }

  // POST: Assign a new task
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const { assignee, title, description, due_date, priority } = body;

      if (!title) {
        return res.status(400).json({ error: 'Görev başlığı (title) zorunludur.' });
      }

      const assigneeKey = (assignee || 'furkan').toLowerCase().trim();
      const matchedEmployee = EMPLOYEE_MAP[assigneeKey] || EMPLOYEE_MAP.furkan;

      const nowIso = new Date().toISOString();
      const taskId = `GPT-TASK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const taskMessage = JSON.stringify({
        id: taskId,
        assignee_name: matchedEmployee.name,
        title: title,
        description: description || '',
        due_date: due_date || 'Belirtilmedi',
        priority: priority || 'Normal',
        assigned_by: 'ChatGPT AI Assistant',
        created_at: nowIso
      });

      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          id: taskId,
          recipient_employee_id: matchedEmployee.id,
          type: 'gpt_assigned_task',
          title: `🤖 ChatGPT Görevi: ${title}`,
          message: taskMessage,
          related_entity_type: 'task',
          related_entity_id: taskId,
          is_read: false,
          created_at: nowIso
        }])
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Görev veritabanına eklenirken hata oluştu', details: error.message });
      }

      return res.status(200).json({
        success: true,
        message: `✅ Görev başarıyla ${matchedEmployee.name} kişisine atandı!`,
        task: {
          id: taskId,
          assigned_to: matchedEmployee.name,
          title: title,
          description: description || '',
          due_date: due_date || 'Belirtilmedi',
          priority: priority || 'Normal',
          created_at: nowIso
        }
      });
    } catch (err) {
      return res.status(500).json({ error: 'Sunucu hatası', details: String(err) });
    }
  }

  return res.status(405).json({ error: 'Sadece GET ve POST istekleri desteklenir.' });
}
