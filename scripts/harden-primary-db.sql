-- =========================================================================
-- SOCIALART AJANS — PRIMARY DATABASE (osuwytugjscwhcxxkhfa) RLS HARDENING
-- Bu scripti Birinci Supabase (Operasyon/CRM) Dashboard -> SQL Editor içerisine yapıştırıp çalıştırın.
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
        
        -- 2. Anonim rolden (anon) tüm DELETE, UPDATE yetkilerini geri al
        EXECUTE format('REVOKE DELETE, UPDATE ON public.%I FROM anon;', r.tablename);
        
        -- 3. Giriş yapmış yetkili kullanıcılara tam yetki ver
        EXECUTE format('DROP POLICY IF EXISTS "allow_auth_all_%s" ON public.%I;', r.tablename, r.tablename);
        EXECUTE format('CREATE POLICY "allow_auth_all_%s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', r.tablename, r.tablename);
    END LOOP;
END $$;

-- 4. Özel Tablo Kuralları:
-- 4.1. Müşteri Destek Mesajları: Ziyaretçi sadece INSERT (mesaj gönderme) yapabilir
DROP POLICY IF EXISTS "allow_client_send_support" ON public.client_support_messages;
CREATE POLICY "allow_client_send_support" ON public.client_support_messages
  FOR INSERT TO anon WITH CHECK (true);

-- 4.2. Ödeme Talepleri: Direkt ödeme sayfasında faturanın görünebilmesi için SELECT açık bırakılır
DROP POLICY IF EXISTS "allow_anon_select_payments" ON public.payment_requests;
CREATE POLICY "allow_anon_select_payments" ON public.payment_requests
  FOR SELECT TO anon USING (true);
