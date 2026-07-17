# Supabase Database Integration - Implementation Tasks

- [x] Supabase Kurulumu ve Yapılandırma
  - [x] `.env.local` dosyasına Supabase URL ve Anon Key eklenmesi
  - [x] `lib/supabase/client.ts` oluşturulması
- [x] SQL DDL Tablo Şemalarının Tanımlanması
  - [x] `employees`, `brands`, `ideas`, `cycles`, `workflow_instances`, `workflow_step_instances`, `workflow_history`, `workflow_handoffs`, `notifications`, `workflow_approvals`, `calendar_events`, `reports` tablolarının oluşturulması (starts_at/ends_at, JSONB reports ve audit alanları ile birlikte)
- [x] Repository Katmanının Oluşturulması (`lib/repositories/`)
  - [x] `EmployeeRepository` (get, save, update, delete, getActive, setActive)
  - [x] `BrandRepository` (get, save, update, delete)
  - [x] `WorkflowRepository` (getInstances, getSteps, saveInstances, cancelInstance, deleteInstance, updateInstance, updateStepInstance, incrementProgress, getHistory, saveHistory)
  - [x] `CycleRepository` (get, save)
  - [x] `NotificationRepository` (get, save, markAsRead)
  - [x] `ApprovalRepository` (get, save, update)
  - [x] `IdeaRepository` (get, save, update, toggleVote)
  - [x] `CalendarRepository` (get, save, update, delete)
  - [x] `ReportRepository` (get, save, update, delete)
- [x] UI / Storage Katmanı Köprülemesi
  - [x] Storage dosyalarını (`lib/storage/local-*.ts`) repository çağrılarına yönlendirecek ve geriye dönük uyumluluk için asenkron Promise dönecek şekilde güncelleme (veya doğrudan repository katmanını UI'da kullanma)
  - [x] UI sayfalarındaki `useEffect` ve event handler'ların asenkron yükleme durumlarına göre güncellenmesi
- [x] Manuel Veri Göçü (Migration Helper)
  - [x] `lib/supabase/migration.ts` dosyası ile LocalStorage verilerini Supabase'e aktaran manuel tetikleyici butonun sisteme (örn: Sistem Ayarları veya Profil sayfasına) eklenmesi
- [x] Doğrulama ve Test
  - [x] `npm run lint` hatalarının kontrolü ve çözümü
  - [x] `npm run build` ile derleme kontrolü ve sayfa erişim testleri

## Yetki Bazlı Navigasyon ve Yönetici Çalışma Alanı
- [x] Yetki Tanımları (`config/permissions.ts`)
- [x] Hiyerarşik Çözümleyici Motor (`resolveEffectivePermissions`)
- [x] Premium Erişim Engellendi Sayfası (`components/shared/access-denied.tsx`)
- [x] Rol Bağımsız Dinamik Sidebar (`components/layout/workspace-layout.tsx`)
- [x] Görev Yönetim Sayfası (`/tasks`)
- [x] Takım Üyeleri Kısayol Aliasing (`/teams`)
- [x] Departman İzolasyonu Filtresi (Manager Team Constraint)
- [x] Route Guard Korumaları (`/operations`, `/approvals`, `/employees`, `/brands`, `/calendar`, `/tasks`)
- [x] Test Kreatif Direktör Seed Profili (`lib/supabase/migration.ts`)
- [x] Linting & Production Build Doğrulaması

# Tasks - Employee Editing Functionality

- [x] Form Hook Güncellemesi (`features/employees/hooks/use-employee-form.ts`)
  - [x] İsteğe bağlı `initialEmployee` prop'u alma ve form değerlerini populate etme
  - [x] `submit` adımında update/insert ayrımını yapıp Supabase entegrasyonunu tamamlama
- [x] Form Butonları Güncellemesi (`features/employees/components/employee-form-actions.tsx`)
  - [x] `isEdit` durumuna göre metin güncellemeleri
  - [x] İptal butonuna basıldığında `/employees` sayfasına geri dönme
- [x] Çalışan Kartı Buton Aktivasyonu (`features/employees/components/employee-card.tsx`)
  - [x] "Düzenle" seçeneğini aktif etme ve `/employees/[id]/edit` sayfasına yönlendirme ekleme
- [x] Düzenleme Sayfa Bileşeni (`features/employees/components/employee-edit-page.tsx`)
  - [x] Belirli bir çalışanın verisini çeken, yükleyen ve düzenleme formunu sunan arayüz bileşeni yazma
- [x] Yeni Next.js Sayfa Rotaları (`app/employees/[id]/edit/page.tsx`)
  - [x] Dynamic id yakalayan edit route'u oluşturma
- [x] Test ve Doğrulama
  - [x] Build & Çalışan düzenleme akışının doğrulanması
