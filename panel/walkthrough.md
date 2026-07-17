# Marka Kayıt ve Takip Sistemi Geliştirme Görevleri

Yapılan değişikliklerle yeni anlaşılan markaların kayıt işlemleri ile operasyon süreç takibi birbirinden ayrılmış, kullanıcı deneyimi iyileştirilmiştir.

## Yapılan Değişiklikler

### 1. Veri Modeli ve Doğrulama (`types/domain.ts` & `create-brand-schema.ts`)
- `OperationPlanItem['status']` tipine `'cancelled'` (İptal Edildi) seçeneği eklendi.
- `OPERATION_PLAN_ITEM_STATUS_LABELS` adı altında Türkçe durum etiket eşleştirmeleri tanımlandı.
- **[BrandAssignment]** adında yeni bir arayüz tanımlanarak, markalara atanan ekip üyeleri için veri modeli oluşturuldu.
- `Brand` ve `CreateBrandInput` modelleri `brandAssignments` alanı ile genişletildi.
- Zod şemalarına `brandAssignmentSchema` ve `brandAssignments` validasyonu eklenerek marka atamalarının doğrulanması sağlandı.
- **[Workflow Engine Modelleri]**: `WorkflowStep`, `WorkflowTemplate` ve `OperationTemplate` veri yapıları eklenerek iş akışlarının kuralları tanımlandı.
- `OperationPlanItem` modeli `workflowTemplateId?: string` ve `operationTemplateId?: string` alanları ile genişletildi. `create-brand-schema.ts` üzerindeki validasyon şeması da bu yeni alanları kabul edecek şekilde güncellendi.
- **[Operation Schedule Rules Modelleri]**: `RuleType`, `ReferenceEventType`, `WeekPosition`, `Weekday` ve `ResponsibilityRole` tipleri ile `OperationScheduleRule` veri yapısı tanımlandı.
- **[Operation Template Revizyonu]**: `OperationExecutionMode` (`per_quantity` | `singleton`) eklendi. `OperationTemplate` modeli; `title`, `description`, `workflowTemplateId`, `executionMode`, `defaultResponsibilityRole`, `defaultRuleId` ve `isContentOperation` alanlarıyla genişletilerek yeniden tasarlandı.
- **[Aylık Operasyon Dönemi Modeli]**: `OperationCycleStatus` (`planning` | `active` | `completed` | `archived`) ve `BrandOperationCycle` modelleri tanımlanarak operasyonlerin aylık dönemler halinde bağımsızlaşması sağlandı.
- **[Workflow Instance Modelleri]**: `WorkflowInstanceStatus`, `WorkflowInstance` (completedAt opsiyonel tarihi eklendi), `WorkflowStepInstanceStatus` (yeni eklenen `'waiting_approval'` dahil) ve `WorkflowStepInstance` (yeni eklenen `approvalId`, `approvalStatus` ve `submittedForApprovalAt` dahil) veri yapıları tanımlandı.
- **[Workflow History Model]**: `WorkflowHistory` arayüzü eklenerek her iş akışı ilerlemesinin audit log formatında kaydedilmesi sağlandı. Action tiplerine `'approval_requested'`, `'approval_approved'`, `'approval_rejected'` ve `'approval_revision_requested'` durumları entegre edildi.
- **[Version & Override Modeli]**: `Brand` ve `CreateBrandInput` modellerine `templateVersion` ve `templateUpdatedAt` eklendi. `BrandOperationCycle` modeline `isCustomized`, `templateVersion` ve `templateUpdatedAt` alanları eklenerek sürüm farkları ve özelleştirmeler kontrol altına alındı.
- **[Responsibility Assignment Modeli]**: `WorkflowStepInstance` modeline `assignedEmployeeId` ve `assignedAt` alanları eklenerek atama motoru için temel atıldı.
- **[Task Handoff Modelleri]**: `WorkflowHandoff` modeli (`id`, `workflowInstanceId`, `workflowStepInstanceId`, `fromEmployeeId`, `toEmployeeId`, `reason`, `note`, `status`, `createdAt`, `acceptedAt`, `rejectedAt`) sisteme kazandırıldı. `WorkflowStepInstance` modeli; `handoffStatus`, `handoffId` ve `previousAssigneeEmployeeId` alanları ile genişletildi.
- **[Notification Modelleri]**: `Notification` arayüzü ile `NotificationType` (yeni eklenen `'approval_*'` bildirim tipleri dahil) ve `RelatedEntityType` (yeni eklenen `'approval'` dahil) tipleri eklenerek bildirim mimarisi kuruldu.
- **[Workflow Approval Modeli]**: `WorkflowApproval` arayüzü (`id`, `workflowInstanceId`, `workflowStepInstanceId`, `requestedByEmployeeId`, `approverEmployeeId`, `approvalType`, `status`, `note`, `revisionNote`, `createdAt`, `approvedAt`, `rejectedAt`, `revisedAt`) eklenerek onay motoru mimarisi kuruldu.

### 2. Yerel Depolama Modülü (`lib/storage/local-brand-store.ts`, `local-employee-store.ts`, `local-cycle-store.ts`, `local-workflow-instance-store.ts`, `local-handoff-store.ts`, `local-notification-store.ts` & `local-approval-store.ts`)
- Markaları ve çalışanları tarayıcının `localStorage` hafızasında saklamak ve güncellemek için yardımcı depolama katmanı genişletildi.
- Markalar için `deleteBrand(id)` fonksiyonu; çalışanlar için ise `getEmployeeById(id)`, `deleteEmployee(id)` ve `updateEmployee(id, updatedFields)` fonksiyonları yazıldı.
- `saveEmployee` fonksiyonu, mükerrer kayıt oluşturmak yerine çalışanı ID üzerinden eşleştirip üzerine yazacak şekilde güncellendi.
- **[Aylık Dönem Depolama Modülü]**: `lib/storage/local-cycle-store.ts` dosyası oluşturuldu. `getStoredCycles`, `getCyclesByBrandId`, `getCycleById`, `saveOperationCycle` ve `deleteOperationCycle` metotları geliştirildi.
- **[Workflow Instance Depolama Modülü]**: `lib/storage/local-workflow-instance-store.ts` dosyası oluşturuldu. `getStoredWorkflowInstances`, `getWorkflowInstancesByCycleId`, `getWorkflowInstancesByBrandId`, `saveWorkflowInstances` ve `deleteWorkflowInstancesByCycleId` metotları geliştirildi.
  - **Mükerrerlik Koruması**: Kayıt esnasında aynı operasyon dönemi (`cycleId`) için iş akışı örnekleri zaten oluşturulmuşsa hata fırlatılarak mükerrer kayıtlar engellendi.
  - **Aktivite Geçmişi (History) & Güncellemeler**: `updateWorkflowInstance`, `updateWorkflowStepInstance`, `getWorkflowStepInstances`, `getWorkflowStepInstancesByWorkflow`, `getStoredWorkflowHistory`, `getWorkflowHistoryByInstanceId`, `saveWorkflowHistory` ve `deleteWorkflowHistoryByWorkflowId` metotları depolama katmanına eklenerek canlandırıldı.
- **[Task Handoff Depolama Modülü]**: `lib/storage/local-handoff-store.ts` dosyası oluşturuldu. `getStoredHandoffs`, `getHandoffsByStepId`, `getPendingHandoffsForEmployee`, `saveHandoff`, `updateHandoff` ve `cancelHandoff` metotları geliştirilerek paslama istekleri localStorage'a bağlandı.
- **[Notification Depolama Modülü]**: `lib/storage/local-notification-store.ts` dosyası oluşturuldu. `getStoredNotifications`, `getNotificationsByEmployeeId`, `getUnreadNotificationsByEmployeeId`, `saveNotification` (mükerrer okunmamış kayıt denetimiyle), `saveNotifications`, `markNotificationAsRead`, `markAllNotificationsAsRead` ve `deleteNotification` metotları geliştirilerek bildirimler yerel hafızaya bağlandı.
- **[Approval Depolama Modülü]**: `lib/storage/local-approval-store.ts` dosyası oluşturuldu. `getStoredApprovals`, `getApprovalsByEmployeeId`, `getPendingApprovalsForEmployee`, `getApprovalsByWorkflowId`, `saveApproval`, `updateApproval` ve `cancelApproval` metotları geliştirilerek onay kayıtları yerel depolamaya bağlandı.

### 3. Marka ve Çalışan Kayıt Ekranı Sadeleştirmesi & Yönlendirmesi
- Plan listesinde "Gerçekleşen", "Durum" ve "İlerleme" kolonları kaldırıldı. Bu ekranda sadece Başlık, Tip ve Hedef Adet gösterilip düzenlenebilmektedir.
- Çalışan kayıt ekranı (**`/employees/new`**) ve marka kayıt ekranı (**`/brands/new`**), başarılı kaydetme işleminin ardından sırasıyla ilgili listeleme sayfalarına yönlendirecek şekilde güncellendi.

### 4. Marka Detay ve Takip Ekranı Tasarımı (`/brands/[id]`)
- **[app/brands/[id]/page.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/app/brands/[id]/page.tsx)** altında yeni bir dinamik rota sayfası oluşturuldu:
  - **Arayüz:** Sol tarafta Marka İletişim, Tarih, Operasyon Yöneticisi bilgileri; sağ tarafta ise markanın genel operasyonel ilerlemesini gösteren dairesel/çubuk grafikli özet istatistik kartı yer alır.
  - **İşlevsellik:** Alt kısımdaki takip tablosunda hedefler listelenir. "Gerçekleşen Adet" ve "Durum" alanları anlık olarak güncellenebilir. Değişikliklere göre her satırın ve genel markanın ilerleme yüzdeleri otomatik hesaplanır.

### 5. Marka Ekibi Yönetimi
- Marka detay sayfasına "Marka Ekibi" alanı eklendi:
  - Markaya atanmış çalışanlar, unvanları, durumları (Aktif/Pasif vb.) ve o marka özelindeki sorumlulukları kartlar halinde listelenir.
  - "Çalışan Ata" butonu ile açılan modalda, çalışan seçilerek yeni ekip üyesi eklenebilir. Mükerrer atama yapılması engellenmiştir.

### 6. Marka Listeleme Ekranı (/brands)
- **[app/brands/page.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/app/brands/page.tsx)** ve **[brand-list-page.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/brands/components/brand-list-page.tsx)** bileşenleri oluşturularak `/brands` listeleme sayfası hayata geçirildi:
  - Marka adına göre arama, Durum, Paket ve Sorumlu Yönetici filtreleri ile En Yeni, En Eski, A-Z ve İlerleme oranına göre sıralamalar eklendi.
  - Marka kartlarında dinamik ilerleme yüzdeleri, ekip sayısı ve operasyon kalemi sayısı listelendi. Silme işlemi onay dialogu ile kontrol altına alındı.

### 7. Çalışan Listeleme Ekranı (/employees)
- **[app/employees/page.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/app/employees/page.tsx)** ve **[employee-list-page.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/employees/components/employee-list-page.tsx)** bileşenleri oluşturuldu:
  - Çalışan adı soyadı ve e-postasına göre anlık arama, Durum, Çalışma Konumu ve Rol Paketi filtreleri ile sıralama eklendi.
  - Çalışan kartlarında sorumluluk alanı sayısı, manuel override sayısı ve aktif marka atama sayısı listelendi.
  - Çalışan bir markaya atanmışsa silinmesini önleyen marka atama kontrolü eklendi.

### 8. Çalışan Detay Sayfası (/employees/[id])
- **[app/employees/[id]/page.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/app/employees/%5Bid%5D/page.tsx)** rotası oluşturuldu:
  - Çalışanın iletişim bilgileri, sorumluluk alanları (takımları), başlangıç rol paketi, atandığı aktif markalar ve manuel yetki override'larının durum raporu sunulur.

### 9. Rol Bazlı Dashboard ve Operasyon Yönetimi Paneli (/dashboard)
- **[app/dashboard/page.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/app/dashboard/page.tsx)** ve **[dashboard-page.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/dashboard/components/dashboard-page.tsx)** oluşturularak yeni rol bazlı dashboard altyapısı geliştirildi:
  - **Mock Giriş Yetkilendirmesi:** `currentUser` nesnesi projedeki resmi `RolePackageId` tipinde tanımlı olan `'operasyon-yonetimi'` ID'si ile eşleştirildi.
  - **Metrik Kartları & İlerleme Grafikeleri:** Toplam ve aktif marka/çalışan metrikleri, genel ilerleme yüzdeleri, en yüksek/en düşük ilerleme kaydeden ilk 5 marka, en yoğun 5 çalışan ve rol dağılımları listelendi.

### 10. Workflow Engine Altyapısı
- **[workflow-template-seeds.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/workflows/data/workflow-template-seeds.ts)** seed dosyası oluşturularak 6 ana operasyon kalemi iş akışı için detaylı workflow adımları, sıraları ve yönetici onay gereksinimleri tanımlandı.
- **[resolve-operation-workflow.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/lib/workflows/resolve-operation-workflow.ts)** helper fonksiyonu yazılarak, operasyon kalemi eklenirken başlık ve tipe göre en uygun workflow şablon ID'sinin çözümlenmesi sağlandı.

### 11. Operasyon Planlama Kuralları (Operation Scheduling Rules)
- **[operation-schedule-rule-seeds.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/operations/data/operation-schedule-rule-seeds.ts)** seed dosyası oluşturularak Eko, Business ve Booster paketleri için planlama kuralları tanımlandı.
- **[calculate-schedule-date.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/lib/operations/calculate-schedule-date.ts)** helper fonksiyonu yazıldı: `fixed_day`, `relative_to_event` ve `monthly_week` kurallarına göre tarih hesaplama doğrulandı.

### 12. Operation Template Revizyonu (Reçete Yapısına Geçiş)
- **[operation-template-seeds.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/workflows/data/operation-template-seeds.ts)** dosyası güncellenerek 16 adet zengin Operasyon Şablonu tüm yeni veri kuralları ile sisteme tohumlandı.
- **[package-seeds.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/brands/data/package-seeds.ts)** seed yapısı güncellendi: Paketler artık düz metin listesi yerine "Operation Template + Target Count" ilişkisi kuran reçeteler haline getirildi.
- **[package-preview-section.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/brands/components/package-preview-section.tsx)** bileşeni güncellenerek, seçilen paketin içeriğini tohumlardan dinamik eşleştirip kullanıcıya önizleme sunması sağlandı.
- **[use-brand-form.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/brands/hooks/use-brand-form.ts)** hooks katmanındaki metotlar yeni reçete yapısına uyumlu hale getirildi.

### 13. Aylık Operasyon Dönemi (Monthly Operation Cycle)
- **[create-operation-cycle.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/lib/operations/create-operation-cycle.ts)** helper fonksiyonu geliştirildi. Marka şablonundaki planı bağımsızlaştırıp, yeni benzersiz ID'lerle temizleyerek seçilen ay ve yıl için bir `BrandOperationCycle` nesnesi üretmesi sağlandı.
  - **Mükerrerlik Önleme**: Aynı marka için aynı dönem halihazırda oluşturulmuşsa, helper işlem esnasında hata fırlatarak mükerrer oluşumları engeller.
- **[test-cycle-generator.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/scratch/test-cycle-generator.ts)** test betiği üzerinden dönemin başarıyla oluşturulduğu ve mükerrer kayıt engelleme kontrollerinin tam kararlılıkla çalıştığı doğrulanmıştır.

### 14. Workflow Instance Generator (İş Akışı Örneği Oluşturucu)
- **[generate-workflow-instances.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/lib/workflows/generate-workflow-instances.ts)** helper fonksiyonu geliştirildi. Aylık döneme ait hedefleri okuyup `per_quantity` (hedef adet kadar sıralı) veya `singleton` (tekil) kurallarına göre `WorkflowInstance` ve adımlarını temsil eden `WorkflowStepInstance` nesnelerini türetmesi sağlandı.
- **[local-workflow-instance-store.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/lib/storage/local-workflow-instance-store.ts)** depolama modülü oluşturuldu: `saveWorkflowInstances` mükerrer `cycleId` kaydı kontrolü uygulandı.
- **[test-workflow-instance-generator.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/scratch/test-workflow-instance-generator.ts)** test scripti ile 6 iş akışının tam doğrulukla oluşturulduğu ve mükerrer kayıt engelleme kuralının çalıştığı doğrulanmıştır.

### 15. Workflow Runtime Engine (Canlı İş Akışı Motoru)
- **[progress-workflow.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/lib/workflows/progress-workflow.ts)** runtime motoru kodlandı:
  - Adımları complete, skip veya cancel etme aksiyonlarına göre otomatik sıradaki `pending` adımı `active` yapar, tarihleri yazar ve audit geçmiş loglarını (`WorkflowHistory`) kaydeder.
  - **Domino Etkisi**: Tamamlanan iş akışı sayısına göre `OperationPlanItem` kalemlerinin gerçekleşen adedini (`completed`) günceller ve hedefe ulaşıldığında kalem `'completed'` durumuna geçirilir.
  - **Cycle Etkisi**: İptal edilmeyen tüm plan kalemleri tamamlandığında `BrandOperationCycle.status = 'completed'` olarak güncellenir.
  - **Aktivite Geçmişi (WorkflowHistory)**: Her adım değişikliğinde tetiklenerek durum değişimlerini (Kim, Ne Zaman, Hangi Durumdan Hangi Duruma?) audit log olarak saklar.
  - **Event Hooks**: `onWorkflowStarted`, `onStepActivated`, `onStepCompleted`, `onWorkflowCompleted`, `onOperationCompleted` ve `onCycleCompleted` hook yapıları tanımlanıp tetiklendi.
- **[test-workflow-runtime.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/scratch/test-workflow-runtime.ts)** zincirleme runtime testi (Brief $\rightarrow$ Çekim $\rightarrow$ Kurgu $\rightarrow$ Tamamlandı $\rightarrow$ Domino $\rightarrow$ Cycle completed) ile tüm audit log akışı başarıyla test edilmiştir.

### 16. Canlı İş Akışları Arayüz Entegrasyonu (Workflow UI)
- **[brand-workflow-section.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/workflows/components/brand-workflow-section.tsx)**: Marka detay sayfasında (`/brands/[id]`) canlı iş akışlarının yönetildiği ana bileşen.
  - **Dropdown & Yeni Dönem:** Markaya ait operasyon dönemlerini listeler, yeni bir operasyon dönemi (Ay/Yıl seçimiyle) başlatmayı sağlar.
  - **Mükerrerlik & Boş Durum:** Döneme ait iş akışları oluşturulmamışsa "İş Akışlarını Oluştur" CTA'i gösterir ve tetikler.
- **[workflow-instance-card.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/workflows/components/workflow-instance-card.tsx)**: Her iş akışının durumunu, ilerleme çubuğunu, aktif adımını ve aksiyon butonlarını (Tamamla, Geç, İptal) içerir.
  - **Aksiyonlar:** "Tamamla / Geç / İptal" butonları tıklandığında `progressWorkflowStep` çalışarak yerel hafızayı günceller, toast haber verir ve sayfayı yeniler.
  - **Accordion Panelleri:** "Tüm Adımları Göster" ve "Aktivite Geçmişi" (audit log) akordeonlarını yönetir.

### 17. Operation Template Override & Sürüm Kontrolü (Versioning)
- **Modellerin Bağımsızlaştırılması:** Marka şablon planı ile canlı aylık operasyon dönemleri planları birbirinden tamamen bağımsız hale getirildi. Marka şablonu güncellendiğinde geçmiş veya mevcut aktif operasyon dönemlerine dokunulmaz.
- **Sürüm Takibi:** `Brand` modelinde `templateVersion` ve `templateUpdatedAt` alanları; `BrandOperationCycle` modelinde `isCustomized`, `templateVersion` ve `templateUpdatedAt` alanları ile versiyon farkları kontrol altına alındı.
- **Detay Sayfası (`/brands/[id]`) Yönetim Paneli:**
  - **"Düzenlenen Plan" Dropdown'ı:** Kullanıcıya "Marka Şablonu" veya mevcut "Aylık Operasyon Dönemi" planlarından birini seçerek düzenleme yapma imkanı tanır.
  - **"Uygulama Hedefi" Dropdown'ı:** Bir operasyon dönemi düzenlenirken, "Sadece Bu Dönemi Güncelle (Özelleştir)" (isCustomized = true yapar) veya "Şablonu da Güncelle (+1 Sürüm)" (Brand versiyonunu arttırıp şablonu günceller) seçeneklerini sunar.

### 18. Responsibility Assignment Engine (Sorumluluk Atama Motoru)
- **Atama Kuralları:** `WorkflowStepInstance` türetilirken sistem marka ekibini (`Brand.brandAssignments`) sorgular.
- **Akıllı Eşleştirme:** Adımın gerektirdiği `responsibilityRole` ile çalışanın sorumluluk alanı (`responsibility`) Türkçe/İngilizce, büyük/küçük harf duyarsız ve parçalı eşleşmelerle (`matchAssignmentToRole` yardımcı fonksiyonu) otomatik eşleştirilir.
- **Çalışan ve Zaman Damgası:** Eşleşme başarılı olursa `assignedEmployeeId` (ve alias `assigneeEmployeeId`) alanına çalışanın ID'si, `assignedAt` alanına ise geçerli zaman damgası yazılır.
- **Unassigned Fallback:** Eşleşen uygun çalışan yoksa, adım "Atanmamış" (Unassigned, `undefined`) olarak işaretlenerek ileride yeniden atanabilecek şekilde bırakılır.

### 19. My Work (Benim İşlerim) Dashboard Paneli
- **[my-work-page.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/my-work/components/my-work-page.tsx)**: Çalışanlara atanan tüm işlerin listelendiği, filtrelendiği ve yönetildiği ana panel.
  - **Giriş Yapan Çalışan Seçici:** Sağ üst köşedeki dropdown sayesinde, localStorage'da kayıtlı çalışanlar arasında hızlıca geçiş yapılarak atanan işler canlı izlenebilir.
  - **Bugünkü İşler:** Durumu `active` olan ve teslim tarihi bugün olan veya teslim tarihi bulunmayan aktif işlerin listesi.
  - **Aktif İşler:** Durumu `active` olan tüm işlerin listesi.
  - **Bekleyenler:** `status === 'pending'` olan ve özellikle bu çalışana atanmış (`assignedEmployeeId === currentUser.id`) işlerin listesi.
  - **Tamamlananlar:** `WorkflowHistory` kayıtları incelenerek, çalışanın bizzat aksiyon (`complete`, `skip`, `cancel`) aldığı tamamlanmış işlerin geçmiş listesi.
- **[my-work-card.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/my-work/components/my-work-card.tsx)**: Görevin bağlı olduğu Marka, Dönem, İş Akışı Başlığı, Aktif Adım ve Sorumluluk bilgilerini gösterir. `Tamamla`, `Geç` ve `İptal` aksiyonları ile iş akışını ilerletir ve ekranı anlık günceller.
- **[my-work-filters.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/my-work/components/my-work-filters.tsx)**: Marka adına veya iş akışına göre arama ile Marka, Operasyon Dönemi, İçerik Tipi ve Sorumluluk filtrelerini içerir.
- **[my-work-stat-card.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/my-work/components/my-work-stat-card.tsx)**: Aktif, Bugün Teslim, Bekleyen ve Tamamlanan işlerin sayısını özet metrik kartlarıyla listeler.
- **Dashboard Entegrasyonu:** Operasyon panelindeki "Hızlı Erişim ve Aksiyonlar" kartına "Benim İşlerim (My Work)" butonu eklenerek erişilebilirlik sağlandı.

### 20. Task Handoff / Paslama Sistemi
- **[handoff-workflow.ts](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/lib/workflows/handoff-workflow.ts)**: Paslama motorunun iş mantığı.
  - **`requestHandoff`**: Aktif adımı başka bir çalışana devretmek için pending durumunda `WorkflowHandoff` kaydı oluşturur, adımdaki bayrağı pending yapar ve `WorkflowHistory` logunu (`handoff_requested`) yazar. Aynı adım için mükerrer talep açılması ve kişinin işi kendine paslaması engellenmiştir.
  - **`acceptHandoff`**: Talebi kabul eder. Adımın asıl sorumlusu (`assignedEmployeeId`) hedef çalışan olarak güncellenir, `previousAssigneeEmployeeId` eski çalışan olarak kaydedilir ve `WorkflowHistory` günlüğüne `handoff_accepted` logu yazılır.
  - **`rejectHandoff`**: Talebi reddeder. İş adım sorumlusu eski çalışanda kalır, handoff durumu `rejected` olur ve `WorkflowHistory` günlüğüne `handoff_rejected` logu atılır.
- **[handoff-modal.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/my-work/components/handoff-modal.tsx)**: Kart üzerindeki "Pasla" butonuna tıklandığında açılan modal. Hedef çalışanı (kendisi hariç liste), paslama sebebini (Yoğunluk, Uzmanlık vb.) ve açıklama notunu alarak devir isteği oluşturur.
- **[handoff-request-card.tsx](file:///C:/Users/Arda Furkan Aslanbaş/social-art-base/features/my-work/components/handoff-request-card.tsx)**: Çalışanın önüne düşen devralma talebini detaylandırır (Kimden, Neden, Hangi Notla?). "Kabul Et" ve "Reddet" butonlarıyla aksiyon alır.
- **Sekme Entegrasyonu:** `/my-work` paneline **"Bana Paslananlar"** adında yeni bir sekme eklenerek çalışanların onay bekleyen devralma taleplerini takip edebilmesi sağlandı.
- **İş Adımı Koruması:** Bir iş adımının paslama talebi pending (beklemede) iken, o adım üzerindeki tamamla/geç/iptal aksiyonları ve yeni paslama istekleri kilitlenir, kart üzerinde "Paslama Bekliyor" uyarısı gösterilir.

### 21. Notification Center (Bildirim Merkezi) Altyapısı
- **Event Hooks & Entegrasyon:** Operasyonel olaylara bağlı olarak otomatik bildirimler tetiklenip localStorage'a yazılır:
  - **İş Atanması (`step_activated`):** Yeni bir iş adımı aktif olduğunda veya iş akışları ilk kez oluşturulduğunda atanan çalışana: `"Yeni iş adımı sana atandı."`
  - **Devir Talebi (`handoff_requested`):** Bir çalışan işini pasladığında hedef çalışana: `"{Sender} sana bir işi pasladı."`
  - **Devir Kabulü (`handoff_accepted`):** Devir onaylandığında eski sorumluya: `"Paslama talebin kabul edildi."`
  - **Devir Reddi (`handoff_rejected`):** Devir reddedildiğinde eski sorumluya: `"Paslama talebin reddedildi."`
  - **İş Akışı Kapanışı (`workflow_completed`):** İş akışı tamamlandığında son sorumluya ve marka operasyon yöneticisine: `"İş akışı tamamlandı."` (Çift bildirim engellemesi uygulandı).
  - **Dönem Kapanışı (`cycle_completed`):** Aylık operasyon dönemi tamamlandığında marka operasyon yöneticisine: `"Aylık operasyon dönemi tamamlandı."`
- **Bildirimler Sayfası (`/notifications`):**
  - **Profil Seçici Dropdown:** Geliştirilen profil değiştirme dropdown'ı ile seçilen çalışanın bildirim kutusuna canlı erişim ve test imkanı sunulur.
  - **Metrikler ve Hızlı Aksiyon:** Okunmamış bildirim adetleri listelenir ve "Tümünü Okundu Yap" butonu ile tek tıkla okunmuş durumuna getirilir.
  - **Gelişmiş Arama ve Filtreleme:** Bildirim mesajlarında serbest arama, okunma durumu filtresi ve bildirim tipi filtreleri ile aranılan bildirim saniyeler içinde bulunabilir.
  - **Dinamik Kartlar:** Okunmamış bildirimler parlayan mavi animasyonla gösterilir. Bildirime tıklanması durumunda otomatik okundu yapılır ve ilgili sayfaya (Örn: iş adımları için `/my-work`, markalar için `/brands/[id]`) yönlendirme yapılır.
- **My Work & Dashboard Entegrasyonları:**
  - `/my-work` sayfasının üst kısmında, okunmamış bildirim sayısı kadar dinamik zıplayan zil ikonu içeren ve `/notifications` sayfasına yönlendiren şık bir uyarı banner'ı yer alır.
  - `/dashboard` hızlı erişim butonlarına "Bildirimler" butonu dahil edildi.

### 22. Approval Engine / Onay Sistemi
Onay gerektiren iş adımları için "Onaya Gönder" ve ajans içi/dış onay süreçlerinin denetlenmesi mekanizması:
- **Onay İş Akışı Motoru (`approval-workflow.ts`):**
  - **`requestApproval`:** `requiresApproval = true` olan aktif adımlarda "Onaya Gönder" tetiklendiğinde `WorkflowApproval` kaydı oluşturur, adımı `'waiting_approval'` durumuna geçirir ve `approval_requested` tipinde geçmiş logu ile approver bildirimini yazar.
  - **`approveApproval`:** Talebi onaylar, adımı `'completed'` yapar ve `progressWorkflowStep` progress motorunu çağırarak sıradaki adıma geçilmesini sağlar. `approval_approved` tarihçe logu ile bildirimini oluşturur.
  - **`requestRevision`:** Talebe revize ister. Adımı tekrar `'active'` yapar, sorumluluğu talep edene geri aktarır ve `approval_revision_requested` logu ile bildirimini oluşturur.
  - **`rejectApproval`:** Talebi reddeder. Adımı `'active'` yapar ve `approval_rejected` logu ile bildirimini oluşturur.
- **Onay Merkezi Ekranı (`/approvals`):**
  - Profil değiştirmeDropdown'ı ile aktif çalışan seçilebilir.
  - Operasyon yöneticisi rolündeki çalışanlar (`operasyon-yonetimi`) tüm pending `internal` onayları görebilir ve onaylayabilir/revize isteyebilir.
  - Müşteri onayları simülasyon amacıyla listede "Müşteri Onayı Bekliyor" etiketiyle listelenir ve manuel onay/revize aksiyonları alınabilir.
  - Revize İste eylemi için gerekçe açıklaması zorunludur ve mockup modal formuyla veri girişi alınır.
- **My Work Entegrasyonu:**
  -requiresApproval olan adımlarda "Tamamla" yerine mor renkli "Onaya Gönder" butonu gösterilir.
  - Adım status değeri `'waiting_approval'` olduğunda kart üzerinde mor renkli "Onay Değerlendirmesi Bekleniyor" uyarısı gösterilir ve diğer tüm butonlar kilitlenir.
- **Dashboard Entegrasyonu:**
  - Hızlı erişim paneline mor renkli "Onay Merkezi" butonu yerleştirildi ve grid kolon sayısı 7'ye genişletildi.

### 23. Premium Görsel ve Estetik İyileştirmeler (SaaS UI Refresh)
Uygulamanın genel görsel kalitesini ve tutarlılığını artırmak amacıyla iş mantığına dokunulmadan estetik iyileştirmeler yapılmıştır:
- **Premium Koyu Tema Temeli:** `globals.css` üzerindeki Shadcn renk değişkenleri derin koyu tonlara (`#09090b` ve `#111115`) ayarlanarak tüm Shadcn bileşenlerinin tutarlı bir koyu moda bürünmesi sağlandı. Radius değeri daha yumuşak ve modern bir görünüm için `0.75rem` (12px) yapıldı.
- **Dinamik Arka Plan Gradiyenti:** `layout.tsx` gövdesine (`body`) modern ve premium bir koyu-mor geçişli arka plan gradiyenti (`from-[#09090b] via-[#111115] to-[#1a112d]`) eklendi.
- **Özel İnce Kaydırma Çubukları (Custom Scrollbar):** Tarayıcı kaydırma çubukları, koyu tema tonlarıyla bütünleşik, hover durumunda mor renkte parlayan ince ve şık bir yapıya dönüştürüldü.
- **Cam Efekti & Parlama Kartları:** Kart hover ve aktifleşme durumlarına eklenen gölgeler ve yumuşak mor/mavi neon ışık haleleri ile sayfalardaki derinlik algısı güçlendirildi.
### 23. Çalışan Düzenleme İşlevselliği (Employee Editing Functionality)

Yöneticilerin çalışanların bilgilerini, ünvanlarını, dahil oldukları takımları ve yetki paketlerini güncelleyebilmesi için düzenleme akışı entegre edildi:
- **Form Hook Revizyonu (`use-employee-form.ts`):** `useEmployeeForm` hook'u artık opsiyonel `initialEmployee` parametresi alabilmektedir. Çalışan verisi yüklendiğinde React state'i otomatik olarak bu değerlerle doldurulur. Form submit adımında ise eğer çalışanın mevcut bir kaydı varsa `createAndStoreEmployee` yerine `updateEmployee(initialEmployee.id, input)` tetiklenir.
- **Dinamik Form Butonları (`employee-form-actions.tsx`):** Buton paneli `isEdit` durumuna göre güncellendi. Düzenleme modunda buton üzerinde "Değişiklikleri Kaydet" yazısı gösterilir. İptal butonuna tıklandığında kullanıcı `/employees` listesine güvenli bir şekilde yönlendirilir.
- **Düzenleme Butonu Aktivasyonu (`employee-card.tsx`):** Çalışan kartı menüsündeki "Düzenle" seçeneğinin `disabled` kilidi kaldırılarak tıklanabilir hale getirildi ve tıklandığında `/employees/[id]/edit` sayfasına yönlendirme sağlandı.
- **Çalışan Düzenleme Sayfası (`employee-edit-page.tsx` & `/employees/[id]/edit/page.tsx`):** Yeni rotada çalışanın mevcut verilerini Supabase'den çekerek formu dolduran ve yöneticilerin düzenleme yapmasına izin veren form bileşenleri oluşturuldu. Yetkisiz girişlerde (örn. `team.manage` izni yoksa) AccessDenied guard'ı devreye girer.
- **Build Doğrulaması:** `npm run build` komutu başarıyla çalıştırılmış ve dynamic employee edit segmenti ile yeni bileşenlerin hatasız derlendiği teyit edilmiştir.
### 24. Dinamik Çalışan Çalışma Alanları (MVP Workspace & Sidebars)
Farklı çalışan rollerinin kendilerini özel bir çalışma ortamında hissetmesi amacıyla şu geliştirmeler eklenmiştir:
- **Rol Odaklı Sol Menü (Sidebar):** `DashboardShell` içerisine sol tarafta dikey olarak konumlanan premium dikey menü entegre edildi. Menü içeriği seçilen çalışanın rolüne (`rolePackageId`) göre dinamik değişir (Örn: Tasarımcı için "Tasarım Masası, Benim Klasörüm, Aktif Tasarımlar", Kurgucu için "Kurgu Masası, Medya Kütüphanesi").
- **Geliştirme Aşamasındaki Sayfalar (Placeholders):** Tasarım belgesinde yer alan ancak MVP aşamasında henüz kodlanmamış yan menü sayfaları için şık bir bilgi toast uyarısı (`toast.info`) entegre edilerek kullanıcı deneyimi korundu.
- **Kişiselleştirilmiş Dashboard ve KPI Kartları:** Operasyon yöneticisi dışındaki diğer çalışanlar için özel `EmployeeDashboard` tasarlandı. Bu ekranda çalışanın kendi ismiyle karşılama mesajı, sadece kendi iş yükü metrikleri, "Öncelikli Aktif İşlerim" listesi ve hızlı tamamla/onaya gönder aksiyonları listelenir.

### 25. Canlı Operasyonlar Merkezi (Live Operations Center - /operations)
Ajansın operasyonlarını anlık olarak izleyebilmek için tasarlanmış canlı kontrol ekranı:
- **Navigasyon Güncellemesi:** Operasyon yöneticisi sol yan menüsündeki "Operasyonlar" bağlantısı artık `/brands` yerine doğrudan `/operations` sayfasına yönlendirir.
- **KPI Kartları:** Aktif kampanya ve iş akışı sayıları, geciken adımlar, onay bekleyen tasarımlar ve aktif devir talepleri sayısını gerçek zamanlı listeler.
- **Sekmeli Canlı Görünüm (Tabs):**
  - *Aktif İş Akışları:* Tamamlanma oranları, aktif adım ve atanan çalışan detaylarıyla listelenir. Tıklandığında ilgili marka detayına (`/brands/[brandId]`) yönlendirilir.
  - *Geciken Adımlar:* Teslim süresi geçmiş işleri kırmızı gecikme sayaçlarıyla listeler.
  - *Onay Bekleyenler & Paslama Talepleri:* İlgili süreçleri hızlı linklerle listeler.
  - *Bugünün Teslimleri:* Bugün bitmesi planlanan işleri ve sorumlularını özetler.
- **Boş Veri Durumu (Empty State):** Sistemde hiç iş akışı olmadığında şık bir bilgilendirme ekranı, yönlendirici açıklama ve "Markalara Git" butonu gösterilir.

### 26. Ortak Çalışma Alanı Modülleri (Fikir Merkezi, Takvim, Raporlar)
Tüm çalışanlar tarafından ortak kullanılacak modüller ve bunlara ait yetkilendirme mekanizmaları:
- **Gelişmiş Takvim Erişimi:** Çalışan ekleme/güncelleme ekranına (`employee-basic-info-section.tsx`) bu erişimi kontrol eden bir Switch eklendi. Yetkisi `false` olan çalışanlar sol menüde **Takvim**'i göremez. Ek olarak, doğrudan URL ile `/calendar` rotasına erişmeye çalışırlarsa **"Giriş Engellendi - Bu sayfayı görüntüleme yetkiniz yok"** ekranı ile karşılaşırlar.
- **Dinamik Takvim Paneli (`/calendar`):** Aylık ızgara (calendar grid) halinde Çekimler, Toplantılar, Teslim Tarihleri, İzinler vb. olayları listeler. Detay pencereleri ve yeni etkinlik ekleme formları mevcuttur.
- **Fikir Merkezi (`/ideas`):** Toplam, bekleyen ve göreve dönüşen fikirlerin KPI kartlarıyla listelendiği, filtreleme paneline sahip ortak fikir havuzu. Fikir ekleme, oy verme, düzenleme ve arşivleme desteklenir. "Göreve Dönüştür" butonu yönetici/admin rollerine özeldir ve şimdilik iş akışını tetikleyen bir bilgilendirme toast'u üretir.
- **Raporlar Paneli (`/reports`):** Günlük, haftalık ve aylık raporlamaları tutan, ayrıca premium **AI Operasyon Özeti (AI Summary)** içeren rapor merkezi.
  - *Rol Bazlı Görünüm:* Standart çalışan sadece kendi raporlarını, Takım Lideri (unvanında lider/yönetici içerenler) ekibinin raporlarını, Operasyon Yöneticisi ve Admin ise tüm ajansın raporlarını görebilir ve çalışan bazlı filtreleme yapabilir.
- **Sidebar Ortak Bölümü:** Sol menünün en altına rollerden bağımsız, sıralaması sabit bir **Ortak** menü bölümü yerleştirildi (Fikir Merkezi, Takvim, Raporlar, Bildirimler, Profil).

## Doğrulama / Testler
- **Fikir Paylaşım Yetkilendirmesi:** Fikir paylaşımlarını düzenleme yetkisi yalnızca fikir sahibine (`isCreator`) özel hale getirildi. Artık yöneticiler veya adminler başkalarının fikirlerini düzenleyemez, sadece kendi fikirlerini düzenleyebilir (veya fikirleri arşive/iş akışına dönüştürebilir).
- **Tıklanabilir KPI Filtreleri:**
  - *Raporlar Sayfası (`/reports`):* Raporlar sayfasının üstündeki Günlük, Haftalık, Aylık, Eksik ve Bekleyen Onay KPI kartları tıklanabilir hale getirildi. Kartlara tıklandığında alttaki rapor listesi ve aktif sekme dinamik olarak güncellenir.
  - *Canlı Operasyonlar (`/operations`):* KPI kartları tıklanabilir kılınarak sekme geçişleriyle tam entegre edildi. Ayrıca "Bugünün Teslimleri" kartı 5. KPI olarak eklenerek simetri sağlandı.
  - *Ana Panel (`/dashboard`):* Çalışan ana panelindeki Aktif İşlerim, Bugün Teslim, Bana Paslananlar ve Yeni Bildirimler kartları tıklanabilir filtreler haline getirilerek alttaki listeyi "Bana Paslanan Devir Talepleri" ve "Yeni Bildirimlerim" gibi dinamik listelere dönüştürür. Yönetici panelinde ise "Toplam Marka/Aktif Markalar" tıklandığında `/brands` sayfasına, "Toplam Çalışan/Aktif Çalışanlar" tıklandığında `/employees` listesine yönlendirilir.
- `scratch/test-approval.ts` entegrasyon testi çalıştırılarak onaya gönderme, revize isteme, reddetme ve onaylayarak sıradaki adıma geçme süreçleri başarıyla doğrulanmıştır.
- `npm run lint` komutu koşturuldu ve projede **hiçbir ESLint hatası veya uyarısı olmadığı (0 errors, 0 warnings)** doğrulanmıştır.
- `npm run build` komutu başarıyla çalıştırıldı ve tüm kodun production ortamına **sorunsuz derlendiği** teyit edilmiştir.

### 27. Permission-Driven Navigation & Manager Workspace (Rol Bağımsız Yetki Odaklı Altyapı)
Yapılan son güncellemelerle sistemin menü ve sayfa erişimleri tamamen rollerden arındırılmış ve dinamik yetki (permission) tabanlı bir mimariye geçirilmiştir:
- **Yetki Konfigürasyon Tanımları (`config/permissions.ts`):** 
  - Sistemdeki tüm yetkiler hiyerarşik gruplar altında tanımlanmıştır (`operations.view`, `task.manage`, `team.manage`, `approval.review`, `brand.manage`).
  - İlgili yetkinin hiyerarşideki alt dalları (Örn: `...manage` veya `...review` yetkisi) açıldığında, üst yetkiler olan görüntüleme yetkilerinin (`...view`) otomatik olarak açılmasını sağlayan kalıtım/çözümleme motoru (`resolveEffectivePermissions`) entegre edilmiştir.
- **Erişim Engellendi Ekranı (`components/shared/access-denied.tsx`):**
  - Yetkisiz bir rotaya (doğrudan link veya URL yazarak) girmeye çalışan kullanıcıları karşılayan, premium animasyonlu ve "Dashboard'a Dön" yönlendirmeli ortak bileşen geliştirilmiştir.
- **Dinamik Sidebar (`components/layout/workspace-layout.tsx`):**
  - Sol menü, aktif kullanıcının çözümlenmiş net yetkilerine göre dinamik olarak oluşturulmaktadır. 
  - Hiçbir menü elemanı doğrudan statik rol adına bakılarak gösterilmez.
  - Ortak sayfalar (Ana Panel, Benim İşlerim, Fikir Merkezi, Raporlar, Bildirimler) herkes için açık kalırken; **Operasyonlar (`/operations`)**, **Görev Yönetimi (`/tasks`)**, **Ekip Yönetimi (`/employees` veya `/teams`)** ve **Marka Yönetimi (`/brands`)** bağlantıları ilgili permission çözümlenmesine bağlı hale getirilmiştir.
- **Sayfa Düzeyi Yetki Koruyucuları (Route Guards):**
  - `/operations`, `/approvals`, `/employees`, `/brands`, `/calendar` ve yeni eklenen `/tasks` sayfalarına route guard entegre edilmiş, yetkisiz girişlerde premium `<AccessDenied />` bileşeni döndürülmesi sağlanmıştır.
- **Görev Yönetim Merkezi (`/tasks`):**
  - `task.manage` yetkisine sahip kullanıcıların erişebildiği bu ekranda; iş akışlarındaki tüm görev adımları listelenir, detaylı filtreleme yapılır.
  - Yetkili çalışanlar; **Görev Ata**, **Tarih (Deadline) Değiştir**, **Onaylayıcı Değiştir**, **Destek Ekip Üyeleri Ekle** aksiyonlarını gerçekleştirebilir ve anlık olarak kaydedebilir.
  - **Yeni Özel Görev Ekleme** modalı ile herhangi bir markanın aktif dönem iş akışına anlık özel adımlar eklenebilmektedir.
- **Departman (Takım) Sınırları & Kısıtlamaları:**
  - `merkezi-operasyon` ekibinde olmayan ancak yönetici yetkilerine sahip kullanıcılar (Örn: Kreatif Yönetim rolündeki Kreatif Direktör), `/operations`, `/tasks`, `/employees` ve `/teams` sayfalarında sadece kendi takımlarının/departmanlarının sorumluluk alanındaki görevleri, işleri ve çalışanları görebilir, filtreleyebilir ve yönetebilir.
  - Bu sayede departmanlar arası veri izolasyonu ve yetki sınırları tam olarak güvenceye alınmıştır.
- **Takım Yönetimi Kısayolu (`/teams`):**
  - `/teams` adresi `/employees` ile aynı yetki ve kısıtlama filtrelerine sahip bir alias olarak tanımlanmıştır.
- **Kreatif Direktör Test Çalışanı Seed Edilmesi (`lib/supabase/migration.ts`):**
  - Kolay test ve doğrulama yapılabilmesi amacıyla Kürşat Deren isminde `kreatif-yonetim` rol paketine sahip, `grafik-studyo` ve `post-produksiyon` takımlarında yer alan ve `operations.view`, `task.manage`, `team.manage`, `approval.review` yetki override'ları tanımlanmış bir test profili seed edilmiştir. Sidebar'daki profil switcher ile bu hesaba geçilerek departman bazlı kısıtlamalar anında test edilebilir.
- **Dinamik Rol Şablonları (Preset / Auto-assign):**
  - Yeni çalışan ekleme veya yetki düzenleme ekranında Rol Paketi (`rolePackageId`) seçildiğinde, o role ait varsayılan departmanlar (`teamIds`) otomatik işaretlenecek şekilde güncellendi.
  - Örneğin, **Kreatif Yönetim** seçildiğinde tüm kreatif ekipler (Grafik, Post Prodüksiyon, Fotoğraf vb.) otomatik seçilir; **Operasyon Yönetimi** seçildiğinde `merkezi-operasyon` otomatik seçilir. Yetkiler bu doğrultuda temizlenerek şablon üzerinden küçük override'lar yapılmasına olanak tanınır.
- **Toplu Görev Atama (Bulk Task Assignment Wizard):**
  - Görev Yönetim Merkezi'ne (`/tasks`) üst kısımda yer alan collapsible **"Toplu Görev Ata"** sihirbazı eklendi.
  - Bu sihirbaz sayesinde; seçilen bir markanın, belirli bir departmandaki (Örn: *Video Kurgu* veya *Tümü*) tüm aktif görev adımları tek bir tıkla belirlenen sorumlu çalışana topluca atanabilir (veya tüm atamalar topluca kaldırılabilir). Bu sayede her iş adımını tek tek düzenleme zahmeti ortadan kaldırılmıştır.
- **Production Build Doğrulaması:**
  - `npm run lint` ve `npm run build` komutları başarıyla tamamlanmış, tüm Next.js rotalarının sorunsuz derlendiği teyit edilmiştir.

### 28. Canlı İş Akışları Detay Modalı (Premium Timeline Modal)
- **Akıllı Yönlendirme:** Operasyonlar sayfasındaki aktif işlere veya geciken adımlara tıklandığında doğrudan markanın detay sayfasına gitmek yerine, **ekranı kaplayan şık bir canlı detay modalı** açılması sağlandı.
- **Dinamik Vertical Timeline:** İş akışındaki tüm adımlar dikey bir stepper formatında sıralanır. Tamamlanan adımlar mor checkmark ile, aktif adım ise yeşil bir pulse (nabız) animasyonuyla gösterilir.
- **Detaylı Görev Logları:** Adımdan sorumlu çalışanın avatarlı kartı, varsa yöneticinin onay notu/durumu, devredilen (paslanan) görevlerin handoff detayları ve teslim edilen belgeler/görseller listelenir.
- **Teslim Ayrıştırıcı (Delivery Parser):** Görev teslim açıklaması, fotoğraf ve dosya bağlantılarını otomatik ayrıştırarak tıklanabilir/indirilebilir premium döküman butonları haline getirir.

### 29. Agency Performance Engine (KPI Performans Sistemi - /kpi & /my-kpi)
Ajansın operasyonel verilerini toplayıp çalışan ve ajans genel performansı olarak işleyen entegre performans motoru:
- **5 Boyutlu Performans Karnesi (Performans Karnesi):** Tek bir puan yerine; Disiplin (⏱ %25), Kalite (✨ %30), Operasyon (⚙ %20), Katkı (💡 %5) otomatik skorları ile Yönetici Değerlendirmesi (🤝 %20) olmak üzere 5 boyutta karne üretilir.
- **Yönetici Değerlendirme & Quarterly Review:** Yöneticilerin iletişim, takım çalışması, inisiyatif, problem çözme ve yaratıcılık gibi sayısallaştırılamayan alanlara manuel puan verebildiği, güçlü yönleri, gelişim alanlarını, gelecek hedeflerini ve bonus/terfi uygunluğunu doldurabildiği Quarterly Review form arayüzü entegre edildi.
- **Ajans Skoru (Agency Score):** Dashboard paneline tüm yayınlanmış KPI kartlarının ortalamasından türetilen renkli ve dinamik Ajans Skoru kartı ("Mükemmel", "Sağlıklı", "Kritik" vb.) Highlights/Warnings detaylarıyla eklendi.
- **Erişim Yetkilendirmesi (Role Isolation):** Yöneticiler `/kpi` paneli ile tüm ekibin grafiklerini, trendlerini, gelişimini ve karnelerini yönetebilirken; çalışanlar sadece `/my-kpi` paneli ile kendi kişisel karnelerini (oyunlaştırılmış rozetler ve gelişim trendiyle) görebilir.
- **Nasıl Hesaplanır? Bilgilendirme Paneli:** `/kpi` sayfasına tüm skorların formüllerini ve ağırlıklarını anlatan collapsible bir rehber panel yerleştirildi.

### 30. 100 Puan Tabanlı Ceza ve Ödül Sistemi (Deduction-Based KPI Mimarisi)
Tüm performans karne sistemi 100 puan üzerinden başlayan ceza ve ödül (kesinti/bonus) tabanlı bir mimariye kavuşturulmuştur:
- **100 Puan Başlangıç:** Her dönem başında veya karne oluşturulduğunda çalışan 100 puanla başlar. Yapılan hatalar veya gecikmeler bu skordan düşer, başarılar veya fikirler ise puan ekler (Final KPI skoru 0-100 arasında sınırlandırılır).
- **Unvan Bazlı Görev & Ceza Checklistleri:** `initializeDeductions` fonksiyonu ile çalışanın `rolePackageId` değerine göre ilgili sorumluluk ve hata kalemleri otomatik listelenir.
  - **Sosyal Medya & Strateji Müşteri İlişkileri:** İçerik takvimi gecikmeleri (-10), eksik takvim (-8), takvimin hiç hazırlanmaması (-20), günlük story kontrolü yapılmaması (-3), story paylaşımının unutulması (-5), yanlış içerik paylaşılması (-8), yayına geç teslim (-5), deadline aşımı (-10), habersiz geciktirme (-10) gibi kurallarla puanlanır.
  - **Kreatif Üretim Ekipleri (Tasarım/Kurgu/Fotoğraf):** Kreatif kalite düşüklüğü (-10), kritik görsel/kurgu hatası (-15), revize gecikmesi (-8), dosya teslim düzensizliği (-5), deadline aşımı (-10) gibi kurallarla puanlanır.
  - **Dijital Pazarlama Uzmanı:** Kampanya kurulum gecikmesi (-15), eksik kampanya kurulumu (-10), yanlış hedefleme/bütçe (-15), günlük hesap kontrolü yapılmaması (-10), reject olan reklamın fark edilmemesi (-10), harcama anomalisi tespiti gecikmesi (-15), haftalık optimizasyon eksikliği (-15), kreatif/audience testlerinin yapılmaması (-10'ar puan), raporlama hataları, hesap problemleri (-15) ve tracking hataları (-10) gibi 8 farklı kategorideki 19 kurala göre puanlanır.
- **Yönetici Checklist Formu & Canlı Puanlama:** Değerlendirme modalında yöneticilere sunulan checkbox'lar ile hata kalemleri seçilebilir. Otomatik sistem verilerinden gelen kesintiler (Örn: Gecikmeler) `Sistem` etiketiyle kilitli gelirken, yönetici kontrolündeki kalemler `Yönetici` etiketiyle işaretlenebilir. Seçim yapıldıkça final puanı anlık simüle edilir.
- **Puan Gerekçeleri (Audit Log):** Hem yönetici hem de çalışan karnesinde *"Neden 78 veya 85 aldım?"* sorusunun cevabını şeffafça gösteren satır satır puan log listesi eklenmiştir.
- **3 Aşamalı Performans Renk Kademeleri:**
  - **80 - 100:** Başarılı 🟢 (Yeşil)
  - **60 - 79:** Geliştirilmeli 🟡 (Sarı)
  - **0 - 59:** Kritik 🔴 (Kırmızı)
- **Production Build Doğrulaması:** `npm run build` komutunun hatasız tamamlandığı ve Next.js statik ve dinamik rotalarının başarıyla derlendiği doğrulanmıştır.

