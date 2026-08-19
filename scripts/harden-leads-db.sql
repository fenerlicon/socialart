-- =========================================================================
-- SOCIALART AJANS — LEADS / SALES DATABASE (piffaggeshfrubyjkhej) RLS HARDENING
-- Bu scripti İkinci Supabase (Leads) Dashboard -> SQL Editor içerisine yapıştırıp çalıştırın.
-- =========================================================================

-- 1. Tüm satış ve başvuru tablolarında Row Level Security (RLS) aktif edilir
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ugc_applications ENABLE ROW LEVEL SECURITY;

-- 2. Anonim rolden (anon) tüm SELECT, UPDATE, DELETE yetkileri GERİ ALINIR
REVOKE SELECT, UPDATE, DELETE ON public.leads FROM anon;
REVOKE SELECT, UPDATE, DELETE ON public.contacts FROM anon;
REVOKE SELECT, UPDATE, DELETE ON public.job_applications FROM anon;
REVOKE SELECT, UPDATE, DELETE ON public.ugc_applications FROM anon;

-- 3. Eski izin politikalarını temizle
DROP POLICY IF EXISTS "Public can view leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public select" ON public.leads;
DROP POLICY IF EXISTS "Allow anon read" ON public.leads;

-- 4. YALNIZCA INSERT İzni Tanımla (Web sitesi ziyaretçileri form doldurup gönderebilir, fakat kayıtlı 229 müşteriyi ASLA OKUYAMAZ!)
CREATE POLICY "Allow public website lead submission" ON public.leads
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public contact form submission" ON public.contacts
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public job application submission" ON public.job_applications
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public ugc application submission" ON public.ugc_applications
  FOR INSERT TO anon WITH CHECK (true);

-- 5. Okuma ve Güncelleme İznini Yalnızca Giriş Yapmış Yöneticiye (authenticated / service_role) Ver
CREATE POLICY "Full access for authenticated admins" ON public.leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Full access for contacts authenticated" ON public.contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
