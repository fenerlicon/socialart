# SocialArt Ajans — Geliştirici & AI Ajan Zorunlu Mimari Kuralları (MANDATORY RULES)

Bu dosya, projede geliştirme yapan tüm yapay zeka ajanları ve geliştiriciler için **BAĞLAYICI VE ZORUNLU** kuralları içerir. Herhangi bir değişiklik veya geliştirme yapılmadan önce bu kurallar eksiksiz uygulanacaktır.

---

## 1. Veritabanı ve Şema Uyumluluğu (Schema Contract Rule)
- **Kural:** Veritabanına (`payment_requests`, `employees`, `leads`, `notifications` vb.) `insert` veya `update` atılacak her sütunun Supabase Postgres tablosunda **kesin olarak var olduğu** doğrulanmalıdır.
- **Yasak:** Veritabanında olmayan sütunlar (örn: `paid_at`, rastgele isimlendirilmiş geçici alanlar) doğrudan update/insert objesine eklenemez. Eklenirse Postgres `PGRST204` hatası verir ve işlem sessizce çöker.
- **Zorunluluk:** Değişiklik yapılmadan önce ve yapıldıktan sonra repository/model eşleşmesi test edilmelidir.

---

## 2. UI Katman ve Z-Index Bütünlüğü (Z-Index Stacking Rule)
- **Kural:** Projede açılan modallar (`CustomTaskModal`, `Dialog`, `CheckoutModal`) `z-[9999]` seviyesinde çalışmaktadır.
- **Zorunluluk:** Radix UI veya `@/components/ui/select` gibi `Portal` kullanan tüm dropdown, popover, select ve tooltip bileşenlerinin `SelectContent` katmanı **en az `z-[99999]`** olmak zorundadır.
- **Yasak:** `z-50` veya düşük katmanlı açılır menüler modalların içinde asla bırakılamaz (menü modalın arkasında görünmez kalır).

---

## 3. Serverless ve API Durumsuzluk Kuralı (Stateless Serverless Rule)
- **Kural:** `/api/` altındaki fonksiyonlar (Vercel Serverless Lambdaları) bağımsız container'larda çalışır.
- **Yasak:** Oturum, doğrulama biletleri veya 2FA durumları için bellek içi `Map`, `let sessions = {}` veya global değişkenler kullanılamaz (diğer sunucu örneğine düşüldüğünde oturum kaybolur).
- **Zorunluluk:** Biletler ve tokenlar HMAC imzalı ve stateless (`signTempTicket`, `signSessionToken`) olmalıdır.
- **Zorunluluk:** `vite.config.js` yerel geliştirme ortamında `/api/` isteklerini gövde ayrıştırıcılı (body-parser) olarak karşılamalıdır.

---

## 4. Dinamik Yetki ve Rol Paketi Kuralı (Dynamic Permissions Rule)
- **Kural:** Bir özelliğin veya menünün (örn: `Takvim`, `Raporlar`, `Görevler`) görünürlüğü tek bir statik booleana bağlanamaz.
- **Zorunluluk:** Her zaman `resolveEffectivePermissions` çağrılarak:
  1. `effective.grantedKeys.has('modul.action')`
  2. `activeEmployee.permissionOverrides?.['modul.action']`
  3. Kullanıcının rol paket şablonu (`rolePackageId`)
  birlikte taranarak yetki kararı verilmelidir.

---

## 5. Çift Mimari ve Derleme Disiplini (Dual Architecture & Build Pipeline)
- **Kural:** Proje çift katmanlıdır:
  1. `panel/` -> Next.js 14 App Router (Static Export)
  2. `src/` -> React + Vite Single Page Application
- **Zorunluluk:** Herhangi bir değişiklikten sonra `node scripts/build-all.cjs` çalıştırılarak hem Next.js panelinin (`public/admin/`) hem de Vite uygulamasının (`dist/`) sıfır hata ile derlendiği doğrulanmalıdır.
