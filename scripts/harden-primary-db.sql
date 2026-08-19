-- =========================================================================
-- SOCIALART AJANS — PRIMARY DATABASE (osuwytugjscwhcxxkhfa) RLS HARDENING
-- Bu scripti Supabase Dashboard -> SQL Editor içerisine yapıştırıp çalıştırın.
-- =========================================================================

-- 1. Tüm operasyonel tablolarda Row Level Security (RLS) aktif edilir
ALTER TABLE IF EXISTS public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.active_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_payment_requests ENABLE ROW LEVEL SECURITY;

-- 2. Anonim (anon) rolden tüm tehlikeli yetkiler geri alınır
REVOKE DELETE, UPDATE ON ALL TABLES IN SCHEMA public FROM anon;

-- 3. Eski izin politikalarını temizle
DROP POLICY IF EXISTS "Public can view employees" ON public.employees;
DROP POLICY IF EXISTS "Public can view brands" ON public.brands;
DROP POLICY IF EXISTS "Public can view activity_log" ON public.activity_log;
DROP POLICY IF EXISTS "Public can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public can view active_clients" ON public.active_clients;
DROP POLICY IF EXISTS "Public can view payment_requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Allow anon read" ON public.employees;

-- 4. Sıkı Güvenlik Politikaları Tanımla

-- 4.1. Dahili Tablolar (Personel, Markalar, Bildirimler, Loglar): Anonim okumaya TAMAMEN KAPATILIR
CREATE POLICY "Employees internal only" ON public.employees
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Brands internal only" ON public.brands
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Activity log internal only" ON public.activity_log
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Notifications internal only" ON public.notifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Tasks internal only" ON public.tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Active clients internal only" ON public.active_clients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4.2. Müşteri Destek Mesajları: Ziyaretçi sadece INSERT (mesaj gönderme) yapabilir, diğer mesajları OKUYAMAZ
CREATE POLICY "Allow client to send support message" ON public.client_support_messages
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated read support messages" ON public.client_support_messages
  FOR SELECT TO authenticated USING (true);
