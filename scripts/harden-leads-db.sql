-- =========================================================================
-- SOCIALART AJANS — LEADS / SALES DATABASE (piffaggeshfrubyjkhej) RLS HARDENING
-- Bu scripti İkinci Supabase (Leads) Dashboard -> SQL Editor içerisine yapıştırıp çalıştırın.
-- Herhangi bir tablo adı hatası vermeden dinamik olarak tüm tabloları kilitler.
-- =========================================================================

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) 
    LOOP
        -- 1. Tabloda Row Level Security'yi aktif et
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
        
        -- 2. Anonim rolden (anon) tüm SELECT, UPDATE, DELETE yetkilerini geri al
        EXECUTE format('REVOKE SELECT, UPDATE, DELETE ON public.%I FROM anon;', r.tablename);
        
        -- 3. Ziyaretçilerin YALNIZCA INSERT (yeni form/lead gönderme) yapabilmesine izin ver
        EXECUTE format('DROP POLICY IF EXISTS "allow_anon_insert_%s" ON public.%I;', r.tablename, r.tablename);
        EXECUTE format('CREATE POLICY "allow_anon_insert_%s" ON public.%I FOR INSERT TO anon WITH CHECK (true);', r.tablename, r.tablename);
        
        -- 4. Giriş yapmış yöneticilere tam yetki ver
        EXECUTE format('DROP POLICY IF EXISTS "allow_auth_all_%s" ON public.%I;', r.tablename, r.tablename);
        EXECUTE format('CREATE POLICY "allow_auth_all_%s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', r.tablename, r.tablename);
    END LOOP;
END $$;
