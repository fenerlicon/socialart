-- MIGRATION SCRIPT

CREATE TABLE IF NOT EXISTS "active_clients" (
  "id" bigint PRIMARY KEY,
  "name" text NOT NULL,
  "package" text,
  "progress" integer DEFAULT 0,
  "completed" jsonb,
  "active" jsonb,
  "pending" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "ads_active" boolean DEFAULT false,
  "current_phase" integer DEFAULT 1,
  "monthly_fee" numeric DEFAULT 0,
  "payment_day" integer DEFAULT 1,
  "yetkili_kisi" text,
  "telefon" text,
  "email" text,
  "sektor" text,
  "calisma_baslangic_tarihi" date,
  "durum" text,
  "son_gorusme_tarihi" timestamp with time zone,
  "internal_notes" text,
  "drive_links" jsonb
);

INSERT INTO "active_clients" ("id", "name", "package", "progress", "completed", "active", "pending", "created_at", "ads_active", "current_phase", "monthly_fee", "payment_day", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "durum", "son_gorusme_tarihi", "internal_notes", "drive_links") VALUES ('12', 'Arayanvar', '4 reels, 4 grafik', 33, '["Anlaşma Sağlandı"]', '["Strateji Oluşturma"]', '["İlk Sunum"]', '2026-04-15T12:04:37.537Z', true, 1, '0', 1, NULL, NULL, NULL, NULL, NULL, 'aktif', NULL, '', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "active_clients" ("id", "name", "package", "progress", "completed", "active", "pending", "created_at", "ads_active", "current_phase", "monthly_fee", "payment_day", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "durum", "son_gorusme_tarihi", "internal_notes", "drive_links") VALUES ('6', 'Socketta', '8 Reels, 4 Gönderi', 100, '["Socketta''nın ghost çekim fotoğrafları yatay çifte dönüştürülecek"]', '[]', '[]', '2026-04-08T08:09:14.741Z', false, 3, '0', 1, NULL, NULL, NULL, NULL, NULL, 'aktif', NULL, NULL, '[]') ON CONFLICT DO NOTHING;
INSERT INTO "active_clients" ("id", "name", "package", "progress", "completed", "active", "pending", "created_at", "ads_active", "current_phase", "monthly_fee", "payment_day", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "durum", "son_gorusme_tarihi", "internal_notes", "drive_links") VALUES ('5', 'Karadeniz Et Lokantası', '1 Reels, 1 Gönderi', 0, '[]', '[]', '[]', '2026-04-08T08:09:14.515Z', false, 1, '0', 1, NULL, NULL, NULL, NULL, NULL, 'aktif', NULL, NULL, '[]') ON CONFLICT DO NOTHING;
INSERT INTO "active_clients" ("id", "name", "package", "progress", "completed", "active", "pending", "created_at", "ads_active", "current_phase", "monthly_fee", "payment_day", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "durum", "son_gorusme_tarihi", "internal_notes", "drive_links") VALUES ('13', 'Fahrettin Kabul / Odor Time', 'Diğer (Sunuculu Reklam Videosu)', 10, '["Anlaşma Sağlandı"]', '["Strateji Oluşturma"]', '["İlk Sunum"]', '2026-04-23T11:57:23.202Z', false, 1, '0', 1, NULL, NULL, NULL, NULL, NULL, 'aktif', NULL, NULL, '[]') ON CONFLICT DO NOTHING;
INSERT INTO "active_clients" ("id", "name", "package", "progress", "completed", "active", "pending", "created_at", "ads_active", "current_phase", "monthly_fee", "payment_day", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "durum", "son_gorusme_tarihi", "internal_notes", "drive_links") VALUES ('14', 'Miocasa', 'Sosyal Medya Yönetimi', 0, '[]', '[]', '[]', '2026-04-23T12:09:58.438Z', true, 1, '0', 1, NULL, NULL, NULL, NULL, NULL, 'aktif', NULL, NULL, '[]') ON CONFLICT DO NOTHING;
INSERT INTO "active_clients" ("id", "name", "package", "progress", "completed", "active", "pending", "created_at", "ads_active", "current_phase", "monthly_fee", "payment_day", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "durum", "son_gorusme_tarihi", "internal_notes", "drive_links") VALUES ('2', 'Mall Of Gurme', '3 Story, 8 Reels, 8 Gönderi', 0, '[]', '[]', '["Bu ayın planı hazırlanacak"]', '2026-04-08T08:09:13.864Z', true, 1, '0', 1, NULL, NULL, NULL, NULL, NULL, 'aktif', NULL, NULL, '[]') ON CONFLICT DO NOTHING;
INSERT INTO "active_clients" ("id", "name", "package", "progress", "completed", "active", "pending", "created_at", "ads_active", "current_phase", "monthly_fee", "payment_day", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "durum", "son_gorusme_tarihi", "internal_notes", "drive_links") VALUES ('7', 'VIP Catring', '4 Reels, 4 Gönderi', 0, '[]', '[]', '[]', '2026-04-08T08:09:14.948Z', false, 1, '0', 1, NULL, NULL, NULL, NULL, NULL, 'aktif', NULL, NULL, '[]') ON CONFLICT DO NOTHING;
INSERT INTO "active_clients" ("id", "name", "package", "progress", "completed", "active", "pending", "created_at", "ads_active", "current_phase", "monthly_fee", "payment_day", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "durum", "son_gorusme_tarihi", "internal_notes", "drive_links") VALUES ('3', 'Gurme Bahçeşehir', '3 Story, 8 Reels, 8 Gönderi', 0, '[]', '[]', '[]', '2026-04-08T08:09:14.135Z', true, 1, '0', 1, NULL, NULL, NULL, NULL, NULL, 'aktif', NULL, NULL, '[]') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "activity_log" (
  "id" bigint PRIMARY KEY,
  "user_name" text NOT NULL,
  "action" text NOT NULL,
  "details" text,
  "target_name" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('139', 'Furkan', 'Lead Durumu Güncellendi', '"Arayanvar" isimli potansiyel müşterinin durumu "Anlaşıldı" olarak güncellendi.', 'GENEL', '2026-04-13T08:26:55.451Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('140', 'Furkan', 'Müşteri Kazanıldı', '"Arayanvar" ile anlaşma sağlandı ve aktif müşterilere taşındı.', 'GENEL', '2026-04-13T08:26:55.638Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('141', 'Furkan', 'Yeni Görev Atandı', 'Furkan, Genel için yeni bir göreve başladı: "deneme"', 'GENEL', '2026-04-13T08:28:48.227Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('142', 'Furkan', 'Görev Durumu Güncellendi', 'Furkan, proje üzerindeki görevi sıraya aldı.', 'GENEL', '2026-04-13T08:28:59.585Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('143', 'Furkan', 'Görev Durumu Güncellendi', 'Furkan, proje üzerindeki görevi başarıyla tamamladı: "deneme"', 'GENEL', '2026-04-13T08:29:03.748Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('144', 'Furkan', 'Görev Durumu Güncellendi', 'Furkan, proje üzerindeki görevi sıraya aldı.', 'GENEL', '2026-04-13T08:29:08.622Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('145', 'Furkan', 'Görev Durumu Güncellendi', 'Furkan, proje üzerindeki görevi sıraya aldı.', 'GENEL', '2026-04-13T08:29:14.116Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('146', 'Furkan', 'Yeni Görev Atandı', 'Furkan, Genel için yeni bir göreve başladı: "deneme"', 'GENEL', '2026-04-13T08:30:58.581Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('147', 'Furkan', 'Görev Durumu Güncellendi', 'Furkan, proje üzerindeki göreve başladı: "deneme"', 'GENEL', '2026-04-13T08:31:14.701Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('148', 'Furkan', 'Dürtme!', 'Furkan sizi dürttü: "Görev var"', 'Furkan', '2026-04-13T08:38:31.500Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('149', 'Tuğba', 'Müşteri Bilgileri Güncellendi', 'Tuğba, Mall Of Gurme markası için proje bilgilerini ve ilerleme verilerini güncelledi.', 'Mall Of Gurme', '2026-04-13T09:18:32.073Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('150', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Arayanvar - Hizmet: 360° Sosyal Medya Yönetimi, Influencer Marketing, Kreatif İçerik / Çekim, Video Prodüksiyon', 'GENEL', '2026-04-13T09:43:06.129Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('151', 'Furkan', 'Müşteri Kaydı Silindi', '"Arayanvar" isimli aktif müşteri kaydı sistemden kalıcı olarak silindi.', 'Arayanvar', '2026-04-13T09:43:14.410Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('152', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Demir Saracoğlu  - Hizmet: Diğer (Tüm hizmetlerinizin listesi var mı dedi)', 'GENEL', '2026-04-13T09:48:54.005Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('153', 'Furkan', 'Potansiyel Lead Silindi', '"Nilüfer Küçer" isimli lead kaydı sistemden silindi.', 'GENEL', '2026-04-13T09:55:52.653Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('154', 'Furkan', 'Potansiyel Lead Silindi', '"RZY" isimli lead kaydı sistemden silindi.', 'GENEL', '2026-04-13T09:55:55.741Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('155', 'Furkan', 'Potansiyel Lead Silindi', '"ARZU GÜLERYÜZ ALTINAY" isimli lead kaydı sistemden silindi.', 'GENEL', '2026-04-13T09:55:58.402Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('156', 'Furkan', 'Potansiyel Lead Silindi', '"Erdinç Kuruoğlu" isimli lead kaydı sistemden silindi.', 'GENEL', '2026-04-13T09:56:00.742Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('157', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: ibrahim - Hizmet: Diğer (Bilinmiyor)', 'GENEL', '2026-04-13T09:58:12.413Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('158', 'Furkan', 'Lead Notu Eklendi', '"ibrahim" için yeni bir not eklendi: Merhabalar tabii ki, sizlere hizmetlerimiz hakkında bilgilendirme yapmak isterim. Sunucu hizmeti mi almak istiyorsunuz?', 'GENEL', '2026-04-13T09:58:24.275Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('159', 'Furkan', 'Lead Durumu Güncellendi', '"ibrahim" isimli potansiyel müşterinin durumu "Düşük Kalite" olarak güncellendi.', 'GENEL', '2026-04-13T09:58:30.704Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('160', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Emre Önder - Hizmet: Diğer (Bilinmiyor)', 'GENEL', '2026-04-13T09:59:23.445Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('161', 'Furkan', 'Lead Notu Eklendi', '"Emre Önder" için yeni bir not eklendi: Merhabalar ben Socialart Ajans’tan Tuğba 😇￼', 'GENEL', '2026-04-13T09:59:32.862Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('162', 'Furkan', 'Lead Notu Eklendi', '"Emre Önder" için yeni bir not eklendi: Sizleri hangi hizmetlerimiz ile ilgili bilgilendirelim?', 'GENEL', '2026-04-13T09:59:40.274Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('163', 'Furkan', 'Lead Durumu Güncellendi', '"Emre Önder" isimli potansiyel müşterinin durumu "Düşük Kalite" olarak güncellendi.', 'GENEL', '2026-04-13T09:59:54.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('164', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Gülfem Gürsoy - Hizmet: Diğer (Bilinmiyor)', 'GENEL', '2026-04-13T10:00:44.346Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('165', 'Furkan', 'Lead Notu Eklendi', '"Gülfem Gürsoy" için yeni bir not eklendi: Merhabalar ben Socialart Ajans’tan Tuğba 😇', 'GENEL', '2026-04-13T10:00:53.337Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('166', 'Furkan', 'Lead Notu Eklendi', '"Gülfem Gürsoy" için yeni bir not eklendi: Sizleri hangi hizmetlerimiz ile ilgili bilgilendirelim?
', 'GENEL', '2026-04-13T10:00:58.096Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('167', 'Furkan', 'Lead Durumu Güncellendi', '"Gülfem Gürsoy" isimli potansiyel müşterinin durumu "Düşük Kalite" olarak güncellendi.', 'GENEL', '2026-04-13T10:01:04.324Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('168', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Ali ipek - Hizmet: Diğer (Bilinmiyor)', 'GENEL', '2026-04-13T10:09:55.770Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('169', 'Furkan', 'Lead Notu Eklendi', '"Ali ipek" için yeni bir not eklendi: Merhabalar ben Socialart Ajans’tan Tuğba ', 'GENEL', '2026-04-13T10:10:19.728Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('170', 'Furkan', 'Lead Notu Eklendi', '"Ali ipek" için yeni bir not eklendi: Sizleri hangi hizmetlerimiz ile ilgili bilgilendirelim?
', 'GENEL', '2026-04-13T10:10:23.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('171', 'Furkan', 'Lead Durumu Güncellendi', '"Ali ipek" isimli potansiyel müşterinin durumu "Düşük Kalite" olarak güncellendi.', 'GENEL', '2026-04-13T10:10:28.840Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('172', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: mustafa armağan - Hizmet: Diğer (Bilinmiyor)', 'GENEL', '2026-04-13T10:12:06.333Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('173', 'Furkan', 'Lead Notu Eklendi', '"mustafa armağan" için yeni bir not eklendi: Merhabalar, tabii ki. Sizleri hangi hizmetlerimiz ile ilgili bilgilendirelim?
', 'GENEL', '2026-04-13T10:12:14.532Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('174', 'Furkan', 'Lead Durumu Güncellendi', '"mustafa armağan" isimli potansiyel müşterinin durumu "Düşük Kalite" olarak güncellendi.', 'GENEL', '2026-04-13T10:12:23.430Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('175', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: ARZU GÜLERYÜZ ALTINAY - Hizmet: 360° Sosyal Medya Yönetimi', 'GENEL', '2026-04-13T10:13:28.508Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('176', 'Furkan', 'Lead Notu Eklendi', '"ARZU GÜLERYÜZ ALTINAY" için yeni bir not eklendi: Arzu Hanım merhaba, hangi hizmetlerimiz ile ilgileniyorsunuz? ', 'GENEL', '2026-04-13T10:13:44.168Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('177', 'Furkan', 'Lead Notu Eklendi', '"ARZU GÜLERYÜZ ALTINAY" için yeni bir not eklendi: Merhaba. Hizmetleriniz hakkında bilgi almqk istiyorum.
Hesap yönetimi hizmetiniz var mı?', 'GENEL', '2026-04-13T10:13:52.766Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('178', 'Furkan', 'Lead Notu Eklendi', '"ARZU GÜLERYÜZ ALTINAY" için yeni bir not eklendi: Evet Arzu Hanım, hesap yönetimi hizmetimiz bulunuyor. İsterseniz sizleri arayıp detaylı bilgilendirme sağlayalım.
', 'GENEL', '2026-04-13T10:14:06.478Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('179', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Yunus Çınar | Plastic Surgeon - Hizmet: ', 'GENEL', '2026-04-13T10:16:28.585Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('180', 'Furkan', 'Görev Silindi', 'SİSTEM', 'Görev: "deneme"', '2026-04-13T10:33:33.838Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('181', 'Furkan', 'Görev Silindi', 'SİSTEM', 'Görev: "deneme"', '2026-04-13T10:33:38.778Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('182', 'Tuğba', 'Lead Güncellendi', '"Demir Saracoğlu " bilgilerinde güncelleme yapıldı.', 'GENEL', '2026-04-13T11:02:46.844Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('183', 'Tuğba', 'Lead Güncellendi', '"Arayanvar" bilgilerinde güncelleme yapıldı.', 'GENEL', '2026-04-13T11:03:54.242Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('184', 'Furkan', 'Ödeme Alındı', 'VIP Catring firmasından undefined₺ tutarındaki ödeme başarıyla tahsil edildi.', 'VIP Catring', '2026-04-13T11:25:32.452Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('185', 'Furkan', 'Ödeme Alındı', 'VIP Catring firmasından undefined₺ tutarındaki ödeme başarıyla tahsil edildi.', 'VIP Catring', '2026-04-13T11:26:28.447Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('186', 'Furkan', 'Yeni Görev Atandı', 'Ercan, Genel için yeni bir göreve başladı: "Çekim -deneme-"', 'GENEL', '2026-04-13T13:52:51.271Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('187', 'Furkan', 'Yeni Görev Atandı', 'Ercan, Genel için yeni bir göreve başladı: "deneme"', 'GENEL', '2026-04-13T14:01:39.739Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('188', 'Furkan', 'Görev Silindi', 'SİSTEM', 'Görev: "Çekim -deneme-"', '2026-04-13T14:02:06.597Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('189', 'Furkan', 'Görev Silindi', 'SİSTEM', 'Görev: "deneme"', '2026-04-13T14:02:09.964Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('190', 'Simge', 'Lead Notu Eklendi', '"Demir Saracoğlu " için yeni bir not eklendi: aradım meşguldü tekrar arayacağım', 'GENEL', '2026-04-15T10:21:45.125Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('191', 'Simge', 'Yeni Görev Atandı', 'Simge, Genel için yeni bir göreve başladı: "arayan var markası için 

1) strateji sunumu hazırlandı.
2) influencer listesi hazırlandı, bütçe alınıp tabloya girildii.
3) ugc listesi hazırlandı.
4) cast sunumu hazırlandı.

ercana teslim edildi.
"', 'GENEL', '2026-04-15T10:24:48.248Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('192', 'Simge', 'Görev Durumu Güncellendi', 'Simge, proje üzerindeki görevi başarıyla tamamladı: "arayan var markası için 

1) strateji sunumu hazırlandı.
2) influencer listesi hazırlandı, bütçe alınıp tabloya girildii.
3) ugc listesi hazırlandı.
4) cast sunumu hazırlandı.

ercana teslim edildi.
"', 'GENEL', '2026-04-15T10:24:56.206Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('193', 'Simge', 'Yeni Görev Atandı', 'Simge, Genel için yeni bir göreve başladı: "15.04.2026 çekimi için döner evime içerik stratejisi hazırlanacak."', 'GENEL', '2026-04-15T10:27:28.184Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('194', 'Simge', 'Görev Durumu Güncellendi', 'Simge, proje üzerindeki görevi başarıyla tamamladı: "15.04.2026 çekimi için döner evime içerik stratejisi hazırlanacak."', 'GENEL', '2026-04-15T10:27:32.518Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('195', 'Simge', 'Yeni Görev Atandı', 'Tuğba, Genel için yeni bir göreve başladı: "Döner Evim

1) Mayıs ayı için seçilen videolardaki yazı düzenlemelerini tamamlanacak

 2) Reels kurgularını finalize et ve yayına hazır hale getirilecek.

 3) WhatsApp konum kaydı sürecini takip edilecek ve onay durumunu kontrol edilecek."', 'GENEL', '2026-04-15T11:35:45.215Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('196', 'Simge', 'Yeni Görev Atandı', 'Tuğba, Genel için yeni bir göreve başladı: "PhantomBuster & Lead Generation

 1) Toplanan 200+ e-posta verisini kontrol edilecek (doğruluk & tekrar edenler)

2)  Excel datası segmentlere ayrılacak (plaza / şirket / sektör vb.)

3) Lead’ler için iletişim veya kampanya planı oluşturulacak."', 'GENEL', '2026-04-15T11:36:49.192Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('197', 'Simge', 'Yeni Görev Atandı', 'Tuğba, Genel için yeni bir göreve başladı: "İçerik Planlama & Paylaşım

 1) Tüm markalar için story paylaşımları düzenli olarak sürdürülecek

 2) Planlanan gönderilerin yayın takibi yapılacak

3) Karadeniz Et Lokantası gönderisinin performansı analiz edilecek"', 'GENEL', '2026-04-15T11:37:54.791Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('198', 'Simge', 'Yeni Görev Atandı', 'Tuğba, Genel için yeni bir göreve başladı: "Gurme Bahçeşehir

1) Yeni çekimler arasından Reels içerik seçimleri tamamlanacak

2) Özge Hanım’dan gelen revizeler uygulanarak içerikler güncellenecek
 
3) Güncellenen içerikler paylaşım planına dahil edilecek"', 'GENEL', '2026-04-15T11:38:38.543Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('199', 'Simge', 'Yeni Görev Atandı', 'Furkan, Genel için yeni bir göreve başladı: "metada sunuculu reklam kreatifleri çıkılacak."', 'GENEL', '2026-04-15T11:48:12.053Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('200', 'Simge', 'Yeni Görev Atandı', 'Furkan, Genel için yeni bir göreve başladı: "google ads performans marketing reklamı çıkılacak. Bununla ilgili kreatif briefini betüle vereceğim sen reklamı kurabilirsin."', 'GENEL', '2026-04-15T11:50:11.161Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('201', 'Simge', 'Yeni Görev Atandı', 'Ercan, Genel için yeni bir göreve başladı: "sunucu videosunu google ads''de çıkmak istiyoruz o sebeple videonun aşağıda verilen ölçülerine uygun boyutlarını rica edeceğim.


1920 x 1080
1080 x 1920
1080 x 1080"', 'GENEL', '2026-04-15T11:55:06.710Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('202', 'Furkan', 'Görev Durumu Güncellendi', 'Furkan, proje üzerindeki görevi başarıyla tamamladı: "metada sunuculu reklam kreatifleri çıkılacak."', 'GENEL', '2026-04-15T11:57:27.598Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('203', 'Furkan', 'Görev Durumu Güncellendi', 'Furkan, proje üzerindeki göreve başladı: "google ads performans marketing reklamı çıkılacak. Bununla ilgili kreatif briefini betüle vereceğim sen reklamı kurabilirsin."', 'GENEL', '2026-04-15T11:57:56.646Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('204', 'Furkan', 'Lead Durumu Güncellendi', '"Arayanvar" isimli potansiyel müşterinin durumu "Anlaşıldı" olarak güncellendi.', 'GENEL', '2026-04-15T12:04:37.435Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('205', 'Furkan', 'Müşteri Kazanıldı', '"Arayanvar" ile anlaşma sağlandı ve aktif müşterilere taşındı.', 'GENEL', '2026-04-15T12:04:37.641Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('206', 'Furkan', 'Müşteri Bilgileri Güncellendi', 'Furkan, VIP Catring markası için proje bilgilerini ve ilerleme verilerini güncelledi.', 'VIP Catring', '2026-04-15T13:10:56.914Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('207', 'Furkan', 'Müşteri Bilgileri Güncellendi', 'Furkan, Arayanvar markası için proje bilgilerini ve ilerleme verilerini güncelledi.', 'Arayanvar', '2026-04-15T13:11:21.495Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('208', 'Furkan', 'Müşteri Bilgileri Güncellendi', 'Furkan, Gurme Bahçeşehir markası için proje bilgilerini ve ilerleme verilerini güncelledi.', 'Gurme Bahçeşehir', '2026-04-15T13:11:30.981Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('209', 'Tuğba', 'Görev Durumu Güncellendi', 'Tuğba, proje üzerindeki görevi başarıyla tamamladı: "Döner Evim

1) Mayıs ayı için seçilen videolardaki yazı düzenlemelerini tamamlanacak

 2) Reels kurgularını finalize et ve yayına hazır hale getirilecek.

 3) WhatsApp konum kaydı sürecini takip edilecek ve onay durumunu kontrol edilecek."', 'GENEL', '2026-04-15T13:33:46.459Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('210', 'Tuğba', 'Görev Durumu Güncellendi', 'Tuğba, proje üzerindeki görevi başarıyla tamamladı: "Gurme Bahçeşehir

1) Yeni çekimler arasından Reels içerik seçimleri tamamlanacak

2) Özge Hanım’dan gelen revizeler uygulanarak içerikler güncellenecek
 
3) Güncellenen içerikler paylaşım planına dahil edilecek"', 'GENEL', '2026-04-15T13:33:57.932Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('211', 'Tuğba', 'Görev Durumu Güncellendi', 'Tuğba, proje üzerindeki görevi başarıyla tamamladı: "İçerik Planlama & Paylaşım

 1) Tüm markalar için story paylaşımları düzenli olarak sürdürülecek

 2) Planlanan gönderilerin yayın takibi yapılacak

3) Karadeniz Et Lokantası gönderisinin performansı analiz edilecek"', 'GENEL', '2026-04-15T13:34:17.208Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('212', 'Tuğba', 'Görev Durumu Güncellendi', 'Tuğba, proje üzerindeki görevi başarıyla tamamladı: "PhantomBuster & Lead Generation

 1) Toplanan 200+ e-posta verisini kontrol edilecek (doğruluk & tekrar edenler)

2)  Excel datası segmentlere ayrılacak (plaza / şirket / sektör vb.)

3) Lead’ler için iletişim veya kampanya planı oluşturulacak."', 'GENEL', '2026-04-15T13:34:26.574Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('213', 'Simge', 'Yeni Görev Atandı', 'Celal, Genel için yeni bir göreve başladı: "çekim takviminizi bizlerle paylaşmanızı rica edeceğiz. gitmeden markaya strateji sunumlarını önceden hazırlamış oluruz."', 'GENEL', '2026-04-16T08:03:13.628Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('214', 'Ercan', 'Görev Durumu Güncellendi', 'Ercan, proje üzerindeki görevi başarıyla tamamladı: "sunucu videosunu google ads''de çıkmak istiyoruz o sebeple videonun aşağıda verilen ölçülerine uygun boyutlarını rica edeceğim.


1920 x 1080
1080 x 1920
1080 x 1080"', 'GENEL', '2026-04-16T10:26:02.397Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('215', 'Furkan', 'Çekim Günü Eklendi', 'Döner Evim Pendik için 2026-04-16 tarihinde çekim planlandı.', 'GENEL', '2026-04-16T10:41:58.651Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('216', 'Furkan', 'Çekim Günü Eklendi', 'DİĞER / GENEL için 2026-04-16 tarihinde çekim planlandı.', 'GENEL', '2026-04-16T10:42:25.551Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('217', 'Furkan', 'Çekim Günü Eklendi', 'DİĞER / GENEL için 2026-04-17 tarihinde çekim planlandı.', 'GENEL', '2026-04-16T10:44:31.125Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('218', 'Furkan', 'Çekim Günü Eklendi', 'DİĞER / GENEL için 2026-04-19 tarihinde çekim planlandı.', 'GENEL', '2026-04-16T10:44:57.122Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('219', 'Furkan', 'Takvime Not Eklendi', 'Özge Hanım gelecek (Özel) eklendi.', 'GENEL', '2026-04-16T10:48:42.567Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('220', 'Furkan', 'Takvime Not Eklendi', 'Genel çekim (Çekim) eklendi.', 'GENEL', '2026-04-16T10:49:19.365Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('221', 'Furkan', 'Takvimden Kayıt Silindi', 'Bir randevu veya etkinlik takvimden silindi.', 'GENEL', '2026-04-16T10:49:33.687Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('222', 'Furkan', 'Takvimden Kayıt Silindi', 'Bir randevu veya etkinlik takvimden silindi.', 'GENEL', '2026-04-16T10:49:38.332Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('223', 'Celal', 'Lead Notu Eklendi', '"Yunus Çınar | Plastic Surgeon" için yeni bir not eklendi: Müşteri geri dönüş yaptı mekan önerilerini konuştuk stüdyo dışında dış çekim istiyor bilgi verildi dönüş bekleniyor değerlendirecekmiş.', 'GENEL', '2026-04-16T11:13:24.762Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('224', 'Celal', 'Lead Notu Eklendi', '"Fahrettin Kabul / Odor Time" için yeni bir not eklendi: Bu hafta içi gelip koku makinesi bırakacağını ve sosyal medya detaylarını konuşacağımızı söylemişti bir yoklama çekilebilir. ', 'GENEL', '2026-04-16T11:15:39.575Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('225', 'Celal', 'Görev Durumu Güncellendi', 'Celal, proje üzerindeki görevi başarıyla tamamladı: "çekim takviminizi bizlerle paylaşmanızı rica edeceğiz. gitmeden markaya strateji sunumlarını önceden hazırlamış oluruz."', 'GENEL', '2026-04-16T11:19:43.123Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('226', 'Celal', 'Yeni Görev Atandı', 'Ercan, Genel için yeni bir göreve başladı: "Sahne marin drone çekimi yapılacak"', 'GENEL', '2026-04-16T11:25:51.324Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('227', 'Ercan', 'Görev Durumu Güncellendi', 'Ercan, proje üzerindeki görevi sıraya aldı.', 'GENEL', '2026-04-16T11:26:35.467Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('228', 'Ercan', 'Görev Durumu Güncellendi', 'Ercan, proje üzerindeki görevi başarıyla tamamladı: "Sahne marin drone çekimi yapılacak"', 'GENEL', '2026-04-16T11:26:59.651Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('229', 'Ercan', 'Görev Durumu Güncellendi', 'Ercan, proje üzerindeki görevi sıraya aldı.', 'GENEL', '2026-04-16T11:28:53.336Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('230', 'Celal', 'Dürtme!', 'Celal sizi dürttü: "nerdesin"', 'Ercan', '2026-04-16T11:31:21.863Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('231', 'Simge', 'Yeni Görev Atandı', 'Ercan, Genel için yeni bir göreve başladı: "Arayan Var  3''lü Grid Brief whatsapptan ilettim."', 'GENEL', '2026-04-16T11:39:16.570Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('232', 'Simge', 'Yeni Görev Atandı', 'Simge, Genel için yeni bir göreve başladı: "Arayan Var 3lü Grid için Breif hazırlanacak."', 'GENEL', '2026-04-16T11:39:46.853Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('233', 'Simge', 'Görev Durumu Güncellendi', 'Simge, proje üzerindeki görevi başarıyla tamamladı: "Arayan Var 3lü Grid için Breif hazırlanacak."', 'GENEL', '2026-04-16T11:39:51.593Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('234', 'Simge', 'Yeni Görev Atandı', 'Simge, Genel için yeni bir göreve başladı: "Arayan Var Meta Hesabı kurulacak."', 'GENEL', '2026-04-16T11:42:44.705Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('235', 'Celal', 'Takvime Not Eklendi', 'sunucu çekimi (Çekim) eklendi.', 'GENEL', '2026-04-16T14:16:15.435Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('236', 'Furkan', 'Görev Durumu Güncellendi', 'Furkan, proje üzerindeki görevi başarıyla tamamladı: "metada sunuculu reklam kreatifleri çıkılacak."', 'GENEL', '2026-04-16T16:39:38.944Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('237', 'Ercan', 'Yeni Görev Atandı', 'Ercan, Genel için yeni bir göreve başladı: "Socketta icon"', 'GENEL', '2026-04-16T16:43:31.034Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('242', 'Furkan', 'Günlük Rapor Sunuldu', 'Furkan bugün yaptığı işlerin raporunu sisteme işledi.', 'YÖNETİM', '2026-04-16T22:48:14.915Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('243', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: İlmi Sina Doğal Sağlık Ürünleri - Hizmet: Diğer (Sunuculu Reklam Videosu)', 'GENEL', '2026-04-17T09:18:07.991Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('244', 'Furkan', 'Lead Notu Eklendi', '"İlmi Sina Doğal Sağlık Ürünleri" için yeni bir not eklendi: Merhabalar, tabii ki. Dilerseniz iletişim numaranızı bizlerle paylaşın sizleri  arayalım. Taleplerinizi dinleyelim ve detaylı bilgilendirme sağlayalım ☺️🙏
', 'GENEL', '2026-04-17T09:18:14.929Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('245', 'Furkan', 'Lead Notu Eklendi', '"İlmi Sina Doğal Sağlık Ürünleri" için yeni bir not eklendi: -müşteri telefon numarası iletti-
', 'GENEL', '2026-04-17T09:18:30.100Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('246', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: erenhaneren - Hizmet: Diğer (Sunuculu reklam videosu)', 'GENEL', '2026-04-17T09:19:17.700Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('247', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Katia / Keyana  - Hizmet: ', 'GENEL', '2026-04-17T09:21:18.173Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('248', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Mustafa Kılıç  - Hizmet: 360° Sosyal Medya Yönetimi', 'GENEL', '2026-04-17T09:22:30.785Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('249', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Merve  - Hizmet: 360° Sosyal Medya Yönetimi, Diğer (Sunuculu reklam videosu)', 'GENEL', '2026-04-17T09:23:14.005Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('250', 'Simge', 'Yeni Görev Atandı', 'Simge, Genel için yeni bir göreve başladı: "socketta sporcu tema ugc liste hazırlanacak."', 'GENEL', '2026-04-18T08:28:38.478Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('251', 'Simge', 'Yeni Görev Atandı', 'Betül, Genel için yeni bir göreve başladı: "arayan var için 5 grafik hazırlanacak. Breifleri whatsapp üzerinden ilettim."', 'GENEL', '2026-04-18T08:32:13.687Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('252', 'Simge', 'Lead Notu Eklendi', '"Merve " için yeni bir not eklendi: kendisi ile görüştüm. https://www.instagram.com/turkiyesothebysrealty?igsh=MTAzYmp3OG9uOW94 bu gayrimenkul şirketinin franchising''ini işletiyorlar. olmak istedikleri bir sayfa var şu şekilde https://www.instagram.com/thejetbusiness?igsh=aHlib2ZkOTg2Y3Uy bunun için sosyal medya hizmeti ve prodüksiyon hizmeti istiyorlar. kendilerini bilgilendirdim. ekibi ile görüşecek online bir görüşme için takvim oluşturacağız.

not: yerleri Sarıyer''de.', 'GENEL', '2026-04-18T08:35:56.238Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('253', 'Simge', 'Lead Notu Eklendi', '"İlmi Sina Doğal Sağlık Ürünleri" için yeni bir not eklendi: Selim Bey sıvı mum üretimi yapıyor. İşletmesi Bahçelievler’de, Şirinevler Metro çıkışında. 4 farklı mum çeşidi için sunuculu profesyonel bir çekim yaptırmak istiyor.

Teklif hazırlarken ürünlerin bize gönderilip ofiste çekim yapılması ve çekimin kendi ofisinde yapılması olmak üzere iki farklı fiyat seçeneği sunabilir miyiz?', 'GENEL', '2026-04-18T08:37:35.889Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('254', 'Simge', 'Lead Notu Eklendi', '"Katia / Keyana " için yeni bir not eklendi: kendisi ile pazartesi 14:00''e toplantı ayarlandı.', 'GENEL', '2026-04-18T08:39:54.038Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('255', 'Simge', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Volkan Alacalıoğlu - Hizmet: ', 'GENEL', '2026-04-18T08:41:59.092Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('256', 'Simge', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Gökhan Güven - Hizmet: ', 'GENEL', '2026-04-18T08:42:34.453Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('257', 'Simge', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Soldeenerji - Hizmet: ', 'GENEL', '2026-04-18T08:43:25.591Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('258', 'Simge', 'Lead Güncellendi', '"Gökhan Güven" bilgilerinde güncelleme yapıldı.', 'GENEL', '2026-04-18T08:43:59.038Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('259', 'Ercan', 'Görev Durumu Güncellendi', 'Ercan, proje üzerindeki görevi başarıyla tamamladı: "Arayan Var  3''lü Grid Brief whatsapptan ilettim."', 'GENEL', '2026-04-18T10:36:13.653Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('260', 'Ercan', 'Görev Durumu Güncellendi', 'Ercan, proje üzerindeki görevi başarıyla tamamladı: "Sahne marin drone çekimi yapılacak"', 'GENEL', '2026-04-18T10:36:22.827Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('261', 'Ercan', 'Görev Durumu Güncellendi', 'Ercan, proje üzerindeki görevi başarıyla tamamladı: "Socketta icon"', 'GENEL', '2026-04-18T10:59:28.866Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('262', 'Ercan', 'Yeni Görev Atandı', 'Simge, Genel için yeni bir göreve başladı: "Arayanvar sunum hazırlanacak"', 'GENEL', '2026-04-18T17:12:16.221Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('263', 'Furkan', 'Lead Durumu Güncellendi', '"İlmi Sina Doğal Sağlık Ürünleri" isimli potansiyel müşterinin durumu "Reddedildi" olarak güncellendi.', 'GENEL', '2026-04-20T08:03:37.415Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('264', 'Furkan', 'Yeni Görev Atandı', 'Furkan, Socketta için yeni bir göreve başladı: "Socketta''nın ghost çekim fotoğrafları yatay çifte dönüştürülecek"', 'Socketta', '2026-04-20T08:06:54.690Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('265', 'Furkan', 'Görev Durumu Güncellendi', 'Furkan, Socketta üzerindeki görevi başarıyla tamamladı: "Socketta''nın ghost çekim fotoğrafları yatay çifte dönüştürülecek"', 'Socketta', '2026-04-20T08:07:11.452Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('266', 'Furkan', 'Aşama Güncellendi', 'Socketta markası yeni bir evreye geçti: 3. Evre', 'Socketta', '2026-04-20T08:07:11.644Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('267', 'Furkan', 'Takvime Not Eklendi', 'Ataman bey / Turkish Marble Company (Toplantı) eklendi.', 'GENEL', '2026-04-20T13:43:13.505Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('268', 'Furkan', 'Lead Notu Eklendi', '"Katia / Keyana " için yeni bir not eklendi: Görüşme gerçekleşti teklif sunumu iletilecek', 'GENEL', '2026-04-21T10:27:06.035Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('269', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Shahsanam Toprak - Hizmet: Diğer (Sunuculu reklam tanıtım)', 'GENEL', '2026-04-21T10:33:14.004Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('270', 'Furkan', 'Lead Notu Eklendi', '"Shahsanam Toprak" için yeni bir not eklendi: Telefon numarası bekleniyor', 'GENEL', '2026-04-21T10:33:23.843Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('271', 'Furkan', 'Lead Notu Eklendi', '"Soldeenerji" için yeni bir not eklendi: Güneş enerji sistemleri üzerine hizmet veriyorum dedi. Paketleri incelemek istiyorum dedi iletiyorum', 'GENEL', '2026-04-21T10:43:59.131Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('272', 'Furkan', 'Lead Notu Eklendi', '"Fahrettin Kabul / Odor Time" için yeni bir not eklendi: Fahrettin bey perşembe günü öğle saatlerinde gelirim dedi', 'GENEL', '2026-04-21T10:44:17.297Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('273', 'Furkan', 'Lead Durumu Güncellendi', '"Melissa Balo Davet" isimli potansiyel müşterinin durumu "Reddedildi" olarak güncellendi.', 'GENEL', '2026-04-21T10:48:38.851Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('274', 'Furkan', 'Lead Notu Eklendi', '"Yunus Çınar | Plastic Surgeon" için yeni bir not eklendi: Fiyat teklifi iletildi değerlendirecekler', 'GENEL', '2026-04-21T14:45:06.721Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('275', 'Tuğba', 'Lead Notu Eklendi', '"Volkan Alacalıoğlu" için yeni bir not eklendi: Telefonları açmıyor', 'GENEL', '2026-04-22T10:09:02.611Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('276', 'Tuğba', 'Lead Notu Eklendi', '"Gökhan Güven" için yeni bir not eklendi: UGC Çalışması yapılacak', 'GENEL', '2026-04-22T10:10:05.692Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('277', 'Tuğba', 'Lead Durumu Güncellendi', '"ARZU GÜLERYÜZ ALTINAY" isimli potansiyel müşterinin durumu "Düşük Kalite" olarak güncellendi.', 'GENEL', '2026-04-22T10:10:37.232Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('278', 'Tuğba', 'Lead Durumu Güncellendi', '"Katia / Keyana " isimli potansiyel müşterinin durumu "Sıcak" olarak güncellendi.', 'GENEL', '2026-04-22T10:10:43.372Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('279', 'Tuğba', 'Lead Durumu Güncellendi', '"Gökhan Güven" isimli potansiyel müşterinin durumu "Sıcak" olarak güncellendi.', 'GENEL', '2026-04-22T10:10:47.243Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('280', 'Tuğba', 'Lead Durumu Güncellendi', '"erenhaneren" isimli potansiyel müşterinin durumu "Düşük Kalite" olarak güncellendi.', 'GENEL', '2026-04-22T10:17:34.203Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('281', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Reklam 212 / Akın Bey - Hizmet: 360° Sosyal Medya Yönetimi', 'GENEL', '2026-04-22T12:33:15.790Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('282', 'Furkan', 'Lead Notu Eklendi', '"Reklam 212 / Akın Bey" için yeni bir not eklendi: Teklif bekliyor', 'GENEL', '2026-04-22T12:33:21.808Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('283', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: ADS Design / Andaş Hasan Şahin  - Hizmet: Diğer (Sunuculu reklam videosu)', 'GENEL', '2026-04-22T12:34:38.434Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('284', 'Furkan', 'Takvime Not Eklendi', 'Mall Of Çekim (Çekim) eklendi.', 'GENEL', '2026-04-22T14:08:28.177Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('285', 'Furkan', 'Takvime Not Eklendi', 'Catring Çekimi (Çekim) eklendi.', 'GENEL', '2026-04-22T14:09:03.735Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('286', 'Furkan', 'Takvime Not Eklendi', 'Fahrettin Bey geliyor (Toplantı) eklendi.', 'GENEL', '2026-04-22T14:09:54.082Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('287', 'Furkan', 'Lead Notu Eklendi', '"ADS Design / Andaş Hasan Şahin " için yeni bir not eklendi: 5 video için 30k teklif iletildi', 'GENEL', '2026-04-22T14:30:17.764Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('288', 'Furkan', 'Lead Durumu Güncellendi', '"Fahrettin Kabul / Odor Time" isimli potansiyel müşterinin durumu "Anlaşıldı" olarak güncellendi.', 'GENEL', '2026-04-23T11:57:23.261Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('289', 'Furkan', 'Müşteri Kazanıldı', '"Fahrettin Kabul / Odor Time" ile anlaşma sağlandı ve aktif müşterilere taşındı.', 'GENEL', '2026-04-23T11:57:23.462Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('290', 'Furkan', 'Müşteri Kaydı Silindi', '"Döner Evim Pendik" isimli aktif müşteri kaydı sistemden kalıcı olarak silindi.', 'Döner Evim Pendik', '2026-04-23T12:03:04.782Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('291', 'Furkan', 'Yeni Aktif Müşteri Eklendi', 'Miocasa', 'Paket: Sosyal Medya Yönetimi | Reklam: Aktif', '2026-04-23T12:09:58.707Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('292', 'Furkan', 'Lead Durumu Güncellendi', '"Evendify / Okan Serbest" isimli potansiyel müşterinin durumu "Düşük Kalite" olarak güncellendi.', 'GENEL', '2026-04-23T15:41:57.923Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('293', 'Furkan', 'Lead Durumu Güncellendi', '"Shahsanam Toprak" isimli potansiyel müşterinin durumu "Düşük Kalite" olarak güncellendi.', 'GENEL', '2026-04-23T15:42:04.875Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('294', 'Furkan', 'Lead Durumu Güncellendi', '"Demir Saracoğlu " isimli potansiyel müşterinin durumu "Düşük Kalite" olarak güncellendi.', 'GENEL', '2026-04-23T15:42:42.255Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('295', 'Furkan', 'Lead Durumu Güncellendi', '"Merve " isimli potansiyel müşterinin durumu "Düşük Kalite" olarak güncellendi.', 'GENEL', '2026-04-23T15:43:09.200Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('296', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Mustafa Bayrak / Dubai  - Hizmet: Diğer (Sunuculu Reklam Videosu), 360° Sosyal Medya Yönetimi', 'GENEL', '2026-04-23T15:46:01.208Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('297', 'Furkan', 'Lead Durumu Güncellendi', '"Mustafa Bayrak / Dubai " isimli potansiyel müşterinin durumu "Sıcak" olarak güncellendi.', 'GENEL', '2026-04-23T15:46:04.588Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('298', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Reklam 212 / Akın Bey - Hizmet: 360° Sosyal Medya Yönetimi', 'GENEL', '2026-04-25T14:05:42.438Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('299', 'Furkan', 'Lead Notu Eklendi', '"Reklam 212 / Akın Bey" için yeni bir not eklendi: Teklif iletildi ', 'GENEL', '2026-04-25T14:05:51.453Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('300', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: ADS Design / Andaş Hasan Şahin  - Hizmet: Video Prodüksiyon, 360° Sosyal Medya Yönetimi', 'GENEL', '2026-04-25T14:06:42.026Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('301', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Işın Top - Hizmet: Video Prodüksiyon', 'GENEL', '2026-04-25T14:14:32.543Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('302', 'Furkan', 'Lead Notu Eklendi', '"Mustafa Bayrak / Dubai " için yeni bir not eklendi: Mustafa bayrak’a teklif ileteceğiz. 25 video ücreti ve sosyal medya paketi olmak üzere 2 teklif hazırlayacağız. Beyfendi reklam hizmetini biz çalışıp ona para kazandırmaya başladıktan sonra vereceğini söyledi. Bende böyle bir şeyin mümkün olamayacağını izah ettim. Sadece reklamcı ile değil bir ekiple çalışacağını söyledim o da peki o zaman ben ayrı ayrı görebilir miyim anlaşırsak  Türkiye ayağını size veririz dedi', 'GENEL', '2026-04-25T14:15:29.057Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('303', 'Furkan', 'Lead Notu Eklendi', '"ADS Design / Andaş Hasan Şahin " için yeni bir not eklendi: teklifi henüz inceleyememiş', 'GENEL', '2026-04-25T14:15:41.255Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('304', 'Furkan', 'Lead Durumu Güncellendi', '"ADS Design / Andaş Hasan Şahin " isimli potansiyel müşterinin durumu "Sıcak" olarak güncellendi.', 'GENEL', '2026-04-25T14:20:57.174Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('305', 'Furkan', 'Lead Durumu Güncellendi', '"Reklam 212 / Akın Bey" isimli potansiyel müşterinin durumu "Sıcak" olarak güncellendi.', 'GENEL', '2026-04-25T14:20:59.198Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('306', 'Ercan', 'Takvime Not Eklendi', 'Podcast (Çekim) eklendi.', 'GENEL', '2026-04-25T19:45:31.481Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('307', 'Ercan', 'Takvime Not Eklendi', 'Podcast (Çekim) eklendi.', 'GENEL', '2026-04-25T19:45:31.482Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('308', 'Ercan', 'Takvime Not Eklendi', 'Podcast (Çekim) eklendi.', 'GENEL', '2026-04-25T19:45:31.481Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('309', 'Ercan', 'Takvimden Kayıt Silindi', 'Bir randevu veya etkinlik takvimden silindi.', 'GENEL', '2026-04-25T19:45:37.216Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('310', 'Ercan', 'Takvimden Kayıt Silindi', 'Bir randevu veya etkinlik takvimden silindi.', 'GENEL', '2026-04-25T19:45:41.071Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('311', 'Ercan', 'Takvime Not Eklendi', 'Karadeniz Et Çekim (Çekim) eklendi.', 'GENEL', '2026-04-25T19:47:20.203Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('312', 'Ercan', 'Takvime Not Eklendi', 'Moicase Halı çekimi  (Çekim) eklendi.', 'GENEL', '2026-04-26T08:22:30.996Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('313', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Enes Can Bayatlı - Hizmet: Diğer (Sunuculu Reklam Videosu)', 'GENEL', '2026-04-27T08:06:30.112Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('314', 'Furkan', 'Lead Durumu Güncellendi', '"Enes Can Bayatlı" isimli potansiyel müşterinin durumu "Sıcak" olarak güncellendi.', 'GENEL', '2026-04-27T08:08:03.176Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('315', 'Furkan', 'Potansiyel Lead Silindi', '"ADS Design / Andaş Hasan Şahin " isimli lead kaydı sistemden silindi.', 'GENEL', '2026-04-27T08:44:48.873Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('316', 'Furkan', 'Lead Notu Eklendi', '"Reklam 212 / Akın Bey" için yeni bir not eklendi: Teklif iletildi', 'GENEL', '2026-04-27T08:45:06.966Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('317', 'Furkan', 'Potansiyel Lead Silindi', '"Reklam 212 / Akın Bey" isimli lead kaydı sistemden silindi.', 'GENEL', '2026-04-27T08:45:12.773Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('318', 'Furkan', 'Lead Durumu Güncellendi', '"Yunus Çınar | Plastic Surgeon" isimli potansiyel müşterinin durumu "Reddedildi" olarak güncellendi.', 'GENEL', '2026-04-27T08:47:39.472Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('319', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Fatih Aslan - Hizmet: Video Prodüksiyon', 'GENEL', '2026-04-27T10:13:03.795Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('320', 'Ercan', 'Takvime Not Eklendi', 'Kaan emre çekim (Çekim) eklendi.', 'GENEL', '2026-04-28T09:13:40.807Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('321', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: doğuhan taşar - Hizmet: Influencer Marketing, 360° Sosyal Medya Yönetimi, Diğer (Sunuculu reklam)', 'GENEL', '2026-04-28T14:29:33.540Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('322', 'Simge', 'Yeni Görev Atandı', 'Ercan, Genel için yeni bir göreve başladı: "https://trello.com/c/lhf0unYf/184-odortime-4-post-i%CC%87%C3%A7eri%C4%9Fi 

post içeriklerini buradan bulabilirsin. görsel kimlik hazırlamanı rica ediyorum."', 'GENEL', '2026-04-30T11:35:20.582Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('323', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: safa turan - Hizmet: 360° Sosyal Medya Yönetimi, Video Prodüksiyon', 'GENEL', '2026-04-30T11:54:02.172Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('324', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Emel hanım  - Hizmet: 360° Sosyal Medya Yönetimi', 'GENEL', '2026-04-30T11:54:34.200Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('325', 'Furkan', 'Lead Notu Eklendi', '"Mustafa Kılıç " için yeni bir not eklendi: Make up stüdyom var yeni açtım
İnstragram reklam veriyorum sadece ama yetersiz hissediyorum
', 'GENEL', '2026-04-30T11:56:49.430Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('326', 'Furkan', 'Lead Notu Eklendi', '"Volkan Alacalıoğlu" için yeni bir not eklendi: yenileteknoloji.com
Yenile.co 
Nellpro.com
', 'GENEL', '2026-04-30T11:57:38.283Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('327', 'Furkan', 'Lead Notu Eklendi', '"safa turan" için yeni bir not eklendi: teklif bekliyorlar', 'GENEL', '2026-04-30T12:00:00.673Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('328', 'Furkan', 'Lead Notu Eklendi', '"Emel hanım " için yeni bir not eklendi: teklif bekliyorlar', 'GENEL', '2026-04-30T12:00:08.042Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('329', 'Furkan', 'Lead Notu Eklendi', '"Mustafa Kılıç " için yeni bir not eklendi: Stüdyosu daha açılmadı tekrar aranacak', 'GENEL', '2026-04-30T12:13:26.659Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('330', 'Furkan', 'Lead Notu Eklendi', '"Volkan Alacalıoğlu" için yeni bir not eklendi: bir çok kez arandı uluşalımadı, tekrar aranacak', 'GENEL', '2026-04-30T12:13:47.689Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('331', 'Furkan', 'Lead Notu Eklendi', '"Gökhan Güven" için yeni bir not eklendi: bir çok kez arandı ve ulaşılamadı', 'GENEL', '2026-04-30T12:14:13.666Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('332', 'Furkan', 'Lead Notu Eklendi', '"Soldeenerji" için yeni bir not eklendi: fiyatı çok yüksek buldular', 'GENEL', '2026-04-30T12:14:29.750Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('333', 'Furkan', 'Lead Durumu Güncellendi', '"Soldeenerji" isimli potansiyel müşterinin durumu "Düşük Kalite" olarak güncellendi.', 'GENEL', '2026-04-30T12:14:39.045Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('334', 'Furkan', 'Lead Notu Eklendi', '"Reklam 212 / Akın Bey" için yeni bir not eklendi: tekrar aranacak', 'GENEL', '2026-04-30T12:14:57.020Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('335', 'Furkan', 'Lead Notu Eklendi', '"ADS Design / Andaş Hasan Şahin " için yeni bir not eklendi: geri dönüş yapamdı', 'GENEL', '2026-04-30T12:15:07.642Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('336', 'Furkan', 'Lead Notu Eklendi', '"Mustafa Bayrak / Dubai " için yeni bir not eklendi: çalışamaya başlayalım, lead sonrası para veririm dedi', 'GENEL', '2026-04-30T12:15:48.684Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('337', 'Furkan', 'Lead Notu Eklendi', '"Işın Top" için yeni bir not eklendi: yanlış numara', 'GENEL', '2026-04-30T12:16:05.303Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('338', 'Furkan', 'Lead Notu Eklendi', '"Fatih Aslan" için yeni bir not eklendi: whatsapptan en yakın müsaitlik zamanına toplantı yapılacak', 'GENEL', '2026-04-30T12:17:06.730Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('339', 'Furkan', 'Lead Notu Eklendi', '"doğuhan taşar" için yeni bir not eklendi: Teklif iletilecek', 'GENEL', '2026-04-30T12:17:14.620Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('340', 'Furkan', 'Lead Güncellendi', '"Emel hanım " bilgilerinde güncelleme yapıldı.', 'GENEL', '2026-04-30T15:28:19.402Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('341', 'Furkan', 'Lead Güncellendi', '"safa turan" bilgilerinde güncelleme yapıldı.', 'GENEL', '2026-04-30T15:28:42.483Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('342', 'Furkan', 'Lead Güncellendi', '"doğuhan taşar" bilgilerinde güncelleme yapıldı.', 'GENEL', '2026-04-30T15:29:05.241Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('343', 'Furkan', 'Lead Güncellendi', '"Fatih Aslan" bilgilerinde güncelleme yapıldı.', 'GENEL', '2026-04-30T15:29:26.743Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('344', 'Furkan', 'Takvime Not Eklendi', 'Cem Biçer (Toplantı) eklendi.', 'GENEL', '2026-05-02T09:12:17.590Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('345', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: ŞAHIN - Hizmet: Diğer (Bilinmiyor)', 'GENEL', '2026-05-02T12:17:02.123Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('346', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Okshan Oktay - Hizmet: Video Prodüksiyon', 'GENEL', '2026-05-02T12:18:07.174Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('347', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Recep Tanrıkulu  - Hizmet: Diğer', 'GENEL', '2026-05-04T08:05:32.368Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('348', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Ayşegül Solmaz - Hizmet: Diğer (Sunuculu Reklam Videosu)', 'GENEL', '2026-05-04T08:06:53.398Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('349', 'Furkan', 'Lead Durumu Güncellendi', '"Mustafa Bayrak / Dubai " isimli potansiyel müşterinin durumu "Reddedildi" olarak güncellendi.', 'GENEL', '2026-05-04T08:07:14.393Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('350', 'Furkan', 'Lead Durumu Güncellendi', '"Işın Top" isimli potansiyel müşterinin durumu "Düşük Kalite" olarak güncellendi.', 'GENEL', '2026-05-04T08:07:44.083Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('351', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: almila kumbaraci - Hizmet: 360° Sosyal Medya Yönetimi', 'GENEL', '2026-05-04T08:11:43.911Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('352', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Müberra Çavdar - Hizmet: 360° Sosyal Medya Yönetimi', 'GENEL', '2026-05-04T08:13:04.391Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('353', 'Furkan', 'Lead Notu Eklendi', '"Müberra Çavdar" için yeni bir not eklendi: Bilgi verildi ama görüldü attı tekrar iletişim kurulabilir', 'GENEL', '2026-05-04T08:13:26.843Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('354', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Habip Özkan - Hizmet: Diğer (Sunuculu Reklam Videosu)', 'GENEL', '2026-05-04T08:15:00.418Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('355', 'Furkan', 'Lead Notu Eklendi', '"Habip Özkan" için yeni bir not eklendi: buradan bilgilendirebilirmisiniz
ya da wp de üzerinden yazın lütfen
Zamansız aranmak istemiyorum

dedi en son sonrasında bir konuşma gerçekleşmedi', 'GENEL', '2026-05-04T08:15:32.364Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('356', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Cem Yıldırım - Hizmet: Diğer (Sunuculu Reklam Videosu)', 'GENEL', '2026-05-04T08:16:49.546Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('357', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Okan Hocaoğlu - Hizmet: Diğer (Sunuculu Reklam Videosu)', 'GENEL', '2026-05-04T08:18:03.801Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('358', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Ramazan Subaşı - Hizmet: Diğer (Sunuculu Reklam Videosu)', 'GENEL', '2026-05-04T08:19:12.409Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('359', 'Furkan', 'Lead Notu Eklendi', '"Emel hanım " için yeni bir not eklendi: teklif iletildi', 'GENEL', '2026-05-04T08:32:54.918Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('360', 'Furkan', 'Lead Güncellendi', '"Fatih Aslan / Design Floor" bilgilerinde güncelleme yapıldı.', 'GENEL', '2026-05-04T08:45:11.853Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('361', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Georgia / İbrahim Albayrak - Hizmet: 360° Sosyal Medya Yönetimi', 'GENEL', '2026-05-04T09:44:25.432Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('362', 'Furkan', 'Lead Notu Eklendi', '"Georgia / İbrahim Albayrak" için yeni bir not eklendi: Teklif İletildi', 'GENEL', '2026-05-04T09:44:33.205Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('363', 'Furkan', 'Lead Güncellendi', '"Emel hanım / Kozz Atelier" bilgilerinde güncelleme yapıldı.', 'GENEL', '2026-05-04T09:44:58.126Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('364', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Necla / Eğitim Sektörü - Hizmet: 360° Sosyal Medya Yönetimi', 'GENEL', '2026-05-04T09:46:06.344Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('365', 'Furkan', 'Takvime Not Eklendi', 'Sunuculu Reklam Çekimi (Çekim) eklendi.', 'GENEL', '2026-05-04T10:55:14.013Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('366', 'Simge', 'Yeni Görev Atandı', 'Celal, Genel için yeni bir göreve başladı: "Post:

"Lobimizde bir şey eksik, ama ne olduğunu bilmiyorum."

Bize bunu söylediklerinde, 47 odalı butik bir oteldeydik.
Resepsiyonu güzeldi. Işıklandırma mükemmeldi.
Ama misafirler içeri girince duraksayıp "ah işte bu" demiyordu.

Biz o unutulmaz ilk anı yarattık.

Oteldekiler 3 hafta sonra misafir yorumlarına baktıklarında yorumlar şu şekildeydi:
"Burası çok huzurlu."
"Neden bu kadar rahat hissettirdiğini anlayamıyorum."
"Kesinlikle yine geleceğim."

Hiçbiri kokudan bahsetmemişti.
Ama hepsi aynı hissi yaşamıştı.

İşte koku pazarlaması böyle çalışır. Fark edilmez, sadece hissedilir.

Sizin mekânınız da bu hikayeyi yaşayabilir.

Ücretsiz danışmanlık için link bio''da.

#odortimekurumsal #kokumimarı #referans #oteldeneyimi #scentmarketing #müşteribaşarısı #kurumsal koku #hospitality #mekanaruh #ambientscenting

Post:

Bir lobi sadece bir giriş değildir.

İlk izlenim burada başlar.
Misafiriniz kararı  (oturacak mı, kalacak mı, geri dönecek mi) kapıdan girerken zaten verir.

Ve bu kararın %65''i gördüklerine değil,
hissettiklerine dayanır.

Koku, beynin duygusal merkeziyle direkt konuşan tek duyudur.
Biz bu konuşmayı tasarlıyoruz.

Mekânınız için ücretsiz koku danışmanlığı için link bio''da.

#odortimekurumsal #kokumimarı #oteldeneyimi #scentmarketing #kurumsal koku #mekanaruh #hospitality #otelpazarlama #ambientscenting #scentbranding

Post:

Kurumsal kokulandırma bir lüks değil;
markanın en sessiz ama en kalıcı iletişimidir.

Konuşmaz ama hissettirir.
Görünmez ama hatırlatır.
Mekândan çıkıldığında bile etkisi devam eder.

Dünyanın en iyi otelleri bunu biliyor.
En güçlü perakende markaları bunu kullanıyor.
En çok tercih edilen klinikler, hastaların hissettiği ortamı bilinçli olarak tasarlıyor.

Türkiye’de ise bu dönüşüm yeni başlıyor.

Biz, markaların sadece görülmesini değil,
hatırlanmasını sağlıyoruz.

Mekânınızın nasıl hatırlanacağını birlikte belirleyelim. Link Bio’da.

#odortimekurumsal #kokumimarı #scentmarketing #markapazarlama #kurumsalkoku #B2Bpazarlama #otelmarketing #scentbranding

Post:

Evinizin kokusu, misafirlerinizin sizde bıraktığı hissin en güçlü parçası.

Daha kapıdan girer girmez bir sıcaklık,
bir özen,
bir “iyi ki gelmişim” duygusu

Kimse uzun uzun anlatmaz.
Ama herkes hisseder.

Ve bazı evlere insanlar sadece gelmez,
geri de döner.

Sırrınız biziz.

#odortimekurumsal #evkokusu #difüzör #esans #misafirağırlama #evdeiyilik #kokulandırma #huzur #evhissi #kokuterapi"', 'GENEL', '2026-05-04T11:49:22.936Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('367', 'Furkan', 'Lead Notu Eklendi', '"safa turan" için yeni bir not eklendi: Teklif iletildi', 'GENEL', '2026-05-04T14:11:59.940Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('368', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Yasin Uysan / sendekomimarlik - Hizmet: 360° Sosyal Medya Yönetimi, Diğer (Sunuculu Reklam Videosu)', 'GENEL', '2026-05-04T14:15:18.368Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('369', 'Furkan', 'Lead Notu Eklendi', '"Yasin Uysan / sendekomimarlik" için yeni bir not eklendi:  o da 3 farklı şekilde teklif bekliyor.
', 'GENEL', '2026-05-04T14:15:24.966Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('370', 'Furkan', 'Lead Güncellendi', '"almila kumbaraci / mystudiotr" bilgilerinde güncelleme yapıldı.', 'GENEL', '2026-05-04T14:16:11.250Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('371', 'Furkan', 'Lead Notu Eklendi', '"almila kumbaraci / mystudiotr" için yeni bir not eklendi: Çok çok ünlü bir Japon markası olan shiseido markasının saç ürünlerini Japonya’dan getiren bir kadın. Kadına normalde shiseido Türkiye’de yokmuydu var dedim o da saç kısmı yok dedi bu tarafta agresif olarak büyğme ve satış istiyor. Meta ve seo tarafında hizmet istiyor Bizden öneri istiyor. Sosyal medya tarafında nasıl bir çalışma yapabilrşz şeklinde sayfaları çok kötü https://www.instagram.com/mystudiotr?igsh=MXFtc3Z0Y3hkMjEyMg== bu tarafta bu kadını yerinde de ziyaret edebilirsek çok iyi olur. Shiseido çok büyük ve çok oremium bir marka


https://ty.gl/dp7hghcgbhvpl Trendyol mağazası', 'GENEL', '2026-05-04T14:16:28.596Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('372', 'Furkan', 'Lead Notu Eklendi', '"almila kumbaraci / mystudiotr" için yeni bir not eklendi: Buna strateji ve teklif hazırlanacak', 'GENEL', '2026-05-04T14:16:34.573Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('373', 'Furkan', 'Takvime Not Eklendi', 'Japon (Toplantı) eklendi.', 'GENEL', '2026-05-04T14:48:23.123Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('374', 'Furkan', 'Yeni Görev Atandı', 'Furkan, Miocasa için yeni bir göreve başladı: "deneme"', 'Miocasa', '2026-05-04T14:49:24.772Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('375', 'Furkan', 'Görev Silindi', 'SİSTEM', 'Görev: "deneme"', '2026-05-04T14:49:36.892Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('376', 'Furkan', 'Yeni Görev Atandı', 'Furkan, Genel için yeni bir göreve başladı: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"', 'GENEL', '2026-05-04T14:50:08.740Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('377', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Dilara / Makyaj - Hizmet: Diğer (Stüdyoda çekim), 360° Sosyal Medya Yönetimi', 'GENEL', '2026-05-04T15:56:58.600Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('378', 'Furkan', 'Lead Notu Eklendi', '"Katia / Keyana " için yeni bir not eklendi: Başka yerle anlaşmış
', 'GENEL', '2026-05-04T16:26:27.083Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('379', 'Furkan', 'Lead Notu Eklendi', '"Fatih Aslan / Design Floor" için yeni bir not eklendi: Bugün teyitleşeceğiz
-Simge', 'GENEL', '2026-05-04T16:32:21.430Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('380', 'Furkan', 'Lead Notu Eklendi', '"Yasin Uysan / sendekomimarlik" için yeni bir not eklendi: simge hanım arayıp ulaşamamış', 'GENEL', '2026-05-04T16:33:39.518Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('381', 'Furkan', 'Lead Durumu Güncellendi', '"Yasin Uysan / sendekomimarlik" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-04T16:33:51.960Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('382', 'Furkan', 'Lead Durumu Güncellendi', '"Georgia / İbrahim Albayrak" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-04T16:34:27.048Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('383', 'Furkan', 'Lead Durumu Güncellendi', '"Emel hanım / Kozz Atelier" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-04T16:34:51.967Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('384', 'Furkan', 'Lead Durumu Güncellendi', '"doğuhan taşar" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-04T16:34:56.653Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('385', 'Furkan', 'Lead Durumu Güncellendi', '"safa turan" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-04T16:35:03.227Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('386', 'Furkan', 'Lead Notu Eklendi', '"Fatih Aslan / Design Floor" için yeni bir not eklendi: ulaşılamamış', 'GENEL', '2026-05-04T16:35:53.323Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('387', 'Furkan', 'Lead Durumu Güncellendi', '"doğuhan taşar" isimli potansiyel müşterinin durumu "Teklif Bekliyor" olarak güncellendi.', 'GENEL', '2026-05-04T16:36:03.125Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('388', 'Furkan', 'Lead Durumu Güncellendi', '"almila kumbaraci / mystudiotr" isimli potansiyel müşterinin durumu "Teklif Bekliyor" olarak güncellendi.', 'GENEL', '2026-05-04T16:36:25.931Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('389', 'Furkan', 'Yeni Görev Atandı', 'Furkan, Genel için yeni bir göreve başladı: "salpfksrgepsdsşflsreawşsdfsşlgk"', 'GENEL', '2026-05-04T18:15:34.845Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('390', 'Furkan', 'Yeni Görev Atandı', 'Furkan, Genel için yeni bir göreve başladı: "denemedenemedeneme"', 'GENEL', '2026-05-04T18:16:20.816Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('391', 'Furkan', 'Görev Silindi', 'SİSTEM', 'Görev: "salpfksrgepsdsşflsreawşsdfsşlgk"', '2026-05-04T18:43:49.769Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('392', 'Furkan', 'Görev Silindi', 'SİSTEM', 'Görev: "salpfksrgepsdsşflsreawşsdfsşlgk"', '2026-05-04T18:43:52.866Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('393', 'Furkan', 'Görev Silindi', 'SİSTEM', 'Görev: "deneme deneme deneme "', '2026-05-04T18:43:56.412Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('394', 'Furkan', 'Görev Silindi', 'SİSTEM', 'Görev: "deneme deneme deneme "', '2026-05-04T18:44:00.163Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('395', 'Furkan', 'Görev Silindi', 'SİSTEM', 'Görev: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa "', '2026-05-04T18:44:03.829Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('396', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Tunç Bilgen - Hizmet: Sunuculu Reklam Videosu', 'GENEL', '2026-05-05T08:02:36.756Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('397', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Selim İlkılıç  - Hizmet: Sunuculu Reklam Videosu', 'GENEL', '2026-05-05T08:03:41.570Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('398', 'Furkan', 'Lead Notu Eklendi', '"Habip Özkan" için yeni bir not eklendi: 7.30 da arayabilirsiniz
dedi', 'GENEL', '2026-05-05T08:04:19.038Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('399', 'Furkan', 'Lead Güncellendi', '"Habip Özkan" bilgilerinde güncelleme yapıldı.', 'GENEL', '2026-05-05T08:04:27.311Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('400', 'Furkan', 'Lead Güncellendi', '"Okan Hocaoğlu / Japon Konutları" bilgilerinde güncelleme yapıldı.', 'GENEL', '2026-05-05T08:05:10.961Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('401', 'Furkan', 'Lead Notu Eklendi', '"Okan Hocaoğlu / Japon Konutları" için yeni bir not eklendi: Ofise geldi konuştuk teklif bekliyor', 'GENEL', '2026-05-05T08:05:12.969Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('402', 'Furkan', 'Lead Durumu Güncellendi', '"Okan Hocaoğlu / Japon Konutları" isimli potansiyel müşterinin durumu "Teklif Bekliyor" olarak güncellendi.', 'GENEL', '2026-05-05T08:05:18.009Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('403', 'Furkan', 'Lead Durumu Güncellendi', '"doğuhan taşar" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-05T08:33:23.249Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('404', 'Furkan', 'Lead Notu Eklendi', '"almila kumbaraci / mystudiotr" için yeni bir not eklendi: Simge abla teklif hazırlıyor', 'GENEL', '2026-05-05T08:33:32.487Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('405', 'Furkan', 'Lead Notu Eklendi', '"Emel hanım / Kozz Atelier" için yeni bir not eklendi: Başka firma ile anlaştı', 'GENEL', '2026-05-05T14:54:10.901Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('406', 'Furkan', 'Lead Durumu Güncellendi', '"Emel hanım / Kozz Atelier" isimli potansiyel müşterinin durumu "Reddedildi" olarak güncellendi.', 'GENEL', '2026-05-05T14:54:16.628Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('407', 'Simge', 'Lead Notu Eklendi', '"Selim İlkılıç " için yeni bir not eklendi: aradım açmadı
', 'GENEL', '2026-05-05T15:22:10.171Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('408', 'Furkan', 'Lead Durumu Güncellendi', '"Okan Hocaoğlu / Japon Konutları" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-06T08:03:29.729Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('409', 'Furkan', 'Lead Durumu Güncellendi', '"Okan Hocaoğlu / Japon Konutları" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-06T08:37:21.938Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('410', 'Furkan', 'Lead Notu Eklendi', '"Ramazan Subaşı" için yeni bir not eklendi: Yazılım şirketleri var. Teklif bekliyor. ', 'GENEL', '2026-05-06T08:48:53.077Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('411', 'Furkan', 'Lead Durumu Güncellendi', '"Ramazan Subaşı" isimli potansiyel müşterinin durumu "Teklif Bekliyor" olarak güncellendi.', 'GENEL', '2026-05-06T08:48:57.201Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('412', 'Furkan', 'Lead Notu Eklendi', '"Ayşegül Solmaz" için yeni bir not eklendi: Levent’te beyaz yakaların sürekli geldiği bir yer alkol ruhsatını henüz almamışlar. Profesyonel olsun ama resmi olmasın daha sıcak samimi içeriklerin yer aldığı bir sosyal medya ve reklam yönetimi ile bilinirliğinin arttığı bir hizmet istiyor. Burada nasıl bir paket önerelim businness uygun mudur? Teklif bekliyor kendisi', 'GENEL', '2026-05-07T08:03:25.407Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('413', 'Furkan', 'Lead Güncellendi', '"Ayşegül Solmaz" bilgilerinde güncelleme yapıldı.', 'GENEL', '2026-05-07T08:03:41.146Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('414', 'Furkan', 'Lead Güncellendi', '"Ayşegül Solmaz / Cookaba" bilgilerinde güncelleme yapıldı.', 'GENEL', '2026-05-07T08:03:52.603Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('415', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Hande Gürsoy - Hizmet: Video Prodüksiyon', 'GENEL', '2026-05-07T08:06:31.376Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('416', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Tansu güler - Hizmet: 360° Sosyal Medya Yönetimi', 'GENEL', '2026-05-07T08:07:27.030Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('417', 'Furkan', 'Lead Notu Eklendi', '"Tansu güler" için yeni bir not eklendi: Açılışın olduğu gün workshop düzenleyeceğiz burada hem bunu çekmenizi istiyorum hemde benimle röportaj tarzında bir video çekmenizi istiyorum dedi. Ama bu bir defaya mahsus dedi. ( ben onu video çekmeye ikna edebileceğimizi düşünüyorum) kendisi hemen bir yerle anlaşmak istiyor karar vericem artık dedi bende online toplantı talep ettim akşam 20.00 gibi müsait misiniz?', 'GENEL', '2026-05-07T08:07:58.250Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('418', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Volkan Bey / O''ves Skincare - Hizmet: Sunuculu Reklam Videosu', 'GENEL', '2026-05-07T08:10:03.500Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('419', 'Furkan', 'Lead Durumu Güncellendi', '"almila kumbaraci / mystudiotr" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-07T08:12:41.606Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('420', 'Furkan', 'Lead Notu Eklendi', '"almila kumbaraci / mystudiotr" için yeni bir not eklendi: Ulaşılamıyor...', 'GENEL', '2026-05-07T08:12:53.274Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('421', 'Furkan', 'Lead Durumu Güncellendi', '"almila kumbaraci / mystudiotr" isimli potansiyel müşterinin durumu "Reddedildi" olarak güncellendi.', 'GENEL', '2026-05-07T12:30:40.233Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('422', 'Ercan', 'Manuel Randevu Oluşturuldu', 'Mall of için 2026-05-20 (Tüm Gün) randevusu manuel olarak eklendi.', 'GENEL', '2026-05-08T11:08:36.545Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('423', 'Furkan', 'Lead Durumu Güncellendi', '"Tansu güler" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-09T09:25:59.322Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('424', 'Furkan', 'Lead Notu Eklendi', '"Georgia / İbrahim Albayrak" için yeni bir not eklendi: Daha inceleyememiş', 'GENEL', '2026-05-09T09:26:20.200Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('425', 'Furkan', 'Lead Durumu Güncellendi', '"Volkan Bey / O''ves Skincare" isimli potansiyel müşterinin durumu "Teklif Bekliyor" olarak güncellendi.', 'GENEL', '2026-05-09T09:26:54.990Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('426', 'Furkan', 'Lead Durumu Güncellendi', '"Hande Gürsoy" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-09T09:27:11.820Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('427', 'Furkan', 'Lead Notu Eklendi', '"Hande Gürsoy" için yeni bir not eklendi: Online görüşme için tekrar görüşülecek', 'GENEL', '2026-05-09T09:27:37.116Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('428', 'Furkan', 'Lead Durumu Güncellendi', '"Mustafa Kılıç " isimli potansiyel müşterinin durumu "Reddedildi" olarak güncellendi.', 'GENEL', '2026-05-09T09:30:00.170Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('429', 'Furkan', 'Lead Durumu Güncellendi', '"Gökhan Güven" isimli potansiyel müşterinin durumu "Reddedildi" olarak güncellendi.', 'GENEL', '2026-05-09T09:31:21.213Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('430', 'Furkan', 'Lead Durumu Güncellendi', '"Reklam 212 / Akın Bey" isimli potansiyel müşterinin durumu "Reddedildi" olarak güncellendi.', 'GENEL', '2026-05-09T09:31:35.787Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('431', 'Furkan', 'Lead Notu Eklendi', '"Ramazan Subaşı" için yeni bir not eklendi: Toplantı için tarih verecekti dönüş yapmadı', 'GENEL', '2026-05-11T09:09:15.964Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('432', 'Furkan', 'Lead Notu Eklendi', '"Fatih Aslan / Design Floor" için yeni bir not eklendi: tekrar haberleşilecek', 'GENEL', '2026-05-11T09:09:44.611Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('433', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Metin / Sarıhan İşkembe  - Hizmet: 360° Sosyal Medya Yönetimi', 'GENEL', '2026-05-11T09:12:15.300Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('434', 'Furkan', 'Lead Durumu Güncellendi', '"Tansu güler" isimli potansiyel müşterinin durumu "Reddedildi" olarak güncellendi.', 'GENEL', '2026-05-11T12:10:20.579Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('435', 'Furkan', 'Lead Notu Eklendi', '"Tansu güler" için yeni bir not eklendi: Başka yerle anlaşıldı', 'GENEL', '2026-05-11T12:10:30.313Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('436', 'Furkan', 'Lead Notu Eklendi', '"Hande Gürsoy" için yeni bir not eklendi: hala değerlendirme aşamasında', 'GENEL', '2026-05-11T12:10:48.658Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('437', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Fahri Gökya - Hizmet: Diğer (Bilinmiyor)', 'GENEL', '2026-05-11T12:11:31.961Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('438', 'Furkan', 'Takvime Not Eklendi', 'Arayanvar (Çekim) eklendi.', 'GENEL', '2026-05-11T14:34:22.365Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('439', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Selim Bey - Hizmet: 360° Sosyal Medya Yönetimi', 'GENEL', '2026-05-12T20:27:20.215Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('440', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Class Teknoloji - Hizmet: ', 'GENEL', '2026-05-12T20:29:13.967Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('441', 'Furkan', 'Lead Durumu Güncellendi', '"Class Teknoloji" isimli potansiyel müşterinin durumu "Teklif Bekliyor" olarak güncellendi.', 'GENEL', '2026-05-12T20:29:21.983Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('442', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: İnci bulut - Hizmet: ', 'GENEL', '2026-05-12T20:30:52.033Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('443', 'Furkan', 'Lead Durumu Güncellendi', '"İnci bulut" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-12T20:30:56.505Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('444', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Adbusters agency - Hizmet: ', 'GENEL', '2026-05-12T20:31:12.782Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('445', 'Furkan', 'Lead Durumu Güncellendi', '"Adbusters agency" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-12T20:31:17.289Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('446', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Düğün app - Hizmet: ', 'GENEL', '2026-05-12T20:31:38.999Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('447', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Hilal esma bahadur - Hizmet: ', 'GENEL', '2026-05-12T20:31:58.939Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('448', 'Furkan', 'Lead Durumu Güncellendi', '"Hilal esma bahadur" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-12T20:32:03.574Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('449', 'Furkan', 'Lead Durumu Güncellendi', '"Düğün app" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-12T20:32:07.773Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('450', 'Furkan', 'Yeni Potansiyel Lead', 'Sisteme yeni bir başvuru düştü: Octopus software - Hizmet: ', 'GENEL', '2026-05-12T20:32:25.898Z') ON CONFLICT DO NOTHING;
INSERT INTO "activity_log" ("id", "user_name", "action", "details", "target_name", "created_at") VALUES ('451', 'Furkan', 'Lead Durumu Güncellendi', '"Octopus software" isimli potansiyel müşterinin durumu "Teklif İletildi" olarak güncellendi.', 'GENEL', '2026-05-12T20:32:29.078Z') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "appointments" (
  "id" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "full_name" text NOT NULL,
  "phone" text,
  "email" text,
  "url" text,
  "services" text,
  "appointment_date" text NOT NULL,
  "appointment_time" text NOT NULL,
  "status" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('8', 'sunucu çekimi', 'Ercan Celal', 'Stüdyo çekimi ', NULL, NULL, '2026-04-22', '12:00', 'Çekim', '2026-04-16T14:16:15.466Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('2', 'Döner Evim Pendik', 'Celal, Ercan', '', NULL, NULL, '2026-04-16', '19:00', 'Çekim', '2026-04-16T10:41:58.444Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('3', 'Sahne Marin Drone Çekimi', 'Ercan', 'Sahne Marin', NULL, NULL, '2026-04-16', '20:00', 'Çekim', '2026-04-16T10:42:25.358Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('6', 'Özge Hanım gelecek', 'Celal, Ercan, Furkan', '', NULL, NULL, '2026-04-17', '12:00', 'Özel', '2026-04-16T10:48:42.360Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('9', 'Ataman bey / Turkish Marble Company', 'Celal, Ercan, Furkan', '', NULL, NULL, '2026-04-21', '11:00', 'Toplantı', '2026-04-20T13:43:13.268Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('10', 'Mall Of Çekim', 'Celal, Ercan', 'Mall of çekimi', NULL, NULL, '2026-04-24', '12:00', 'Çekim', '2026-04-22T14:08:27.895Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('11', 'Catring Çekimi', 'Celal, Ercan', 'Catring kutlama çekimi', NULL, NULL, '2026-04-25', '12:00', 'Çekim', '2026-04-22T14:09:03.438Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('12', 'Fahrettin Bey geliyor', 'Celal, Ercan, Furkan', 'Koku bırakmaya gelecek', NULL, NULL, '2026-04-23', '12:00', 'Toplantı', '2026-04-22T14:09:53.833Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('15', 'Podcast', '', '', NULL, NULL, '2026-04-30', '12:00', 'Çekim', '2026-04-25T19:45:31.271Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('16', 'Karadeniz Et Çekim', '', '', NULL, NULL, '2026-04-28', '12:00', 'Çekim', '2026-04-25T19:47:20.119Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('17', 'Moicase Halı çekimi ', '', '', NULL, NULL, '2026-04-29', '12:00', 'Çekim', '2026-04-26T08:22:30.900Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('18', 'Kaan emre çekim', '', '', NULL, NULL, '2026-05-05', '12:00', 'Çekim', '2026-04-28T09:13:40.715Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('19', 'Cem Biçer', 'Celal, Ercan', '', NULL, NULL, '2026-05-05', '12:00', 'Toplantı', '2026-05-02T09:12:17.440Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('20', 'Sunuculu Reklam Çekimi', 'Celal, Ercan', 'Odor Time için sunuculu reklam çekimi', NULL, NULL, '2026-05-07', '12:00', 'Çekim', '2026-05-04T10:55:13.592Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('21', 'Japon', 'Celal, Furkan', 'Japonlar geliyor...', NULL, NULL, '2026-05-05', '10:00', 'Toplantı', '2026-05-04T14:48:22.920Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('22', 'Mall of', '', '', NULL, NULL, '2026-05-20', '09:00 - 18:00', 'Onaylandı', '2026-05-08T11:08:36.150Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('23', 'Arayanvar', 'Celal, Ercan', 'Arayanvar çekimi', NULL, NULL, '2026-05-12', '12:00', 'Çekim', '2026-05-11T14:34:22.149Z') ON CONFLICT DO NOTHING;
INSERT INTO "appointments" ("id", "full_name", "phone", "email", "url", "services", "appointment_date", "appointment_time", "status", "created_at") VALUES ('24', 'Furkan', '5370428647', 'sdasda@gmal.com', 'ebe', 'Fotoğraf çekimi', '2026-05-14', '17:00 - 18:00', 'Beklemede', '2026-05-13T09:17:16.586Z') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "blocked_slots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "blocked_date" text NOT NULL,
  "time_slot" text
);

INSERT INTO "blocked_slots" ("id", "blocked_date", "time_slot") VALUES ('de0a96e7-55f8-4b94-9605-97f18b8ea4f5', '2026-05-20', NULL) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "blogs" (
  "id" integer NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "excerpt" text,
  "content" text NOT NULL,
  "read_time" text,
  "cover_image" text,
  "created_at" timestamp with time zone DEFAULT now()
);

INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (1, 'neden-urununuzu-sunucu-cekimi-ile-anlatmalisiniz', 'Neden Ürününüzü Sunucu Çekimi ile Anlatmalısınız?', 'Dijital dünyada kullanıcıların dikkat süresi her geçen gün azalıyor. Özellikle sosyal medya reklamları ve web sitelerinde sadece ürün göstermek yeterli olmuyor...', '
      <h2>Sunucu Çekimi Nedir?</h2>
      <p>Sunucu çekimi; bir kişinin kamera karşısında ürünü deneyimlediği, anlattığı veya kullanıcıya doğrudan hitap ettiği profesyonel video içerikleridir. Bu içerikler reklam filmlerinde, sosyal medya videolarında, e-ticaret ürün tanıtımlarında ve kurumsal marka iletişiminde sıklıkla tercih edilir.</p>
      
      <h2>Ürün Tanıtımında Güven Unsuru Oluşturur</h2>
      <p>Bir kullanıcı satın alma kararı verirken ilk olarak güven duymak ister. Ürünü sadece görsel olarak göstermek yerine, bir sunucunun ürünü anlatması markaya insan dokunuşu kazandırır. Kamera karşısında doğru diksiyonla yapılan bir anlatım, markayı daha profesyonel gösterir, ürünün kullanım alanını net aktarır ve satın alma kararını hızlandırır.</p>
      
      <h2>Reklam Performansını Güçlendirir</h2>
      <p>Meta ve Google reklamlarında video içerikler artık statik görsellere göre çok daha yüksek performans gösteriyor. Ancak burada önemli olan yalnızca video kullanmak değil, dikkat çekici bir anlatım dili oluşturmaktır. Sunucu çekimleri sayesinde ilk 3 saniyede dikkat çekilebilir ve ürünün faydası hızlıca anlatılabilir.</p>
      
      <h2>Sosyal Medyada Daha Fazla Etkileşim Sağlar</h2>
      <p>Algoritmalar insan yüzü bulunan içerikleri daha fazla öne çıkarma eğilimindedir. İnsanlar insanları izlemeyi sever. Doğru kurgu ve doğru sunucu ile hazırlanan içerikler kaydetme oranını artırır ve organik erişime katkı sağlar.</p>
    ', '2 dk okuma', 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&q=80&w=800', '2026-05-11T15:12:18.299Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (2, 'restoraninizi-sosyal-medya-reklam-ve-produksiyon-ile-buyutun', 'Restoranınızı Sosyal Medya, Reklam ve Prodüksiyon ile Büyütün!', 'Günümüzde restoranların başarısı yalnızca lezzetle ölçülmüyor. Müşteriler, bir mekâna gitmeden önce dijitaldeki yansımasını inceliyor...', '
      <h2>Lezzet Kadar Görsellik de Önemli</h2>
      <p>Günümüzde restoranların başarısı yalnızca lezzetle ölçülmüyor. Müşteriler, bir mekâna gitmeden önce Instagram hesaplarını inceliyor, yorumları okuyor ve mekânın atmosferini dijital ortamdan değerlendiriyor.</p>
      <p>İşte bu noktada restoran sosyal medya yönetimi, sosyal medya reklam ve prodüksiyon hizmeti, markaların öne çıkması için kritik bir rol oynuyor. Doğru strateji ve profesyonel içerik ile sosyal medya, restoranların müşteri kazanma, marka bilinirliği artırma ve satışları yükseltme kanalı haline geliyor.</p>
      
      <h2>Profesyonel Fotoğraf ve Video Prodüksiyonu</h2>
      <p>Yemek, göze de hitap eden bir deneyimdir. Menünüzde harika yemekler olabilir, ancak bu yemekler dijital dünyada iyi sunulmuyorsa potansiyel müşterilerin dikkatini çekmesi zordur. Profesyonel prodüksiyon ekibi ile gerçekleştirilen fotoğraf ve video çekimleri, yemeklerinizi adeta iştah açıcı bir sanat eserine dönüştürür.</p>
      
      <h2>Etkileşim Odaklı Sosyal Medya Yönetimi</h2>
      <p>Sadece fotoğraf paylaşmak yeterli değildir. Sosyal medya platformlarında varlık göstermek, aynı zamanda müşterilerle bir diyalog kurmayı gerektirir. Hikayeler (Stories), Reels videoları ve etkileşimli gönderiler sayesinde restoranınız, kitlesiyle sürekli iletişim halinde kalır.</p>
    ', '3 dk okuma', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800', '2026-05-11T15:12:18.474Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (3, 'markalar-neden-ugc-ureticileri-ile-calismali', 'Markalar Neden UGC Üreticileri ile Çalışmalı?', 'Dijital pazarlamada tüketici davranışları köklü şekilde değişti. Kullanıcılar artık klasik reklamlardan çok gerçek insanların deneyimlerine güveniyor...', '
      <h2>UGC (User Generated Content) Nedir?</h2>
      <p>Dijital pazarlamada tüketici davranışları son yıllarda köklü şekilde değişti. Kullanıcılar artık klasik reklamlardan çok gerçek insanların deneyimlerine güveniyor. Bu değişimle birlikte UGC (Kullanıcı Tarafından Üretilen İçerik), markalar için en etkili büyüme araçlarından biri haline geldi.</p>
      
      <h2>Samimiyet ve Güven İnşası</h2>
      <p>Geleneksel stüdyo çekimleri ne kadar profesyonel olursa olsun, tüketicinin gözünde "bu bir reklam" algısı yaratır. Oysa UGC içerikleri amatör bir ruh taşıdığı için doğrudan "tavsiye" olarak algılanır. Bir ürünün gerçek bir evin salonunda veya mutfağında nasıl göründüğünü izlemek, tüketici güvenini katlayarak artırır.</p>
      
      <h2>Daha Düşük Maliyet, Daha Yüksek Etki</h2>
      <p>Geleneksel bir reklam filmi çekmek mekan kirası, profesyonel ekipmanlar, oyuncu kaşeleri gibi ciddi bütçeler gerektirirken; UGC üreticileriyle çalışmak çok daha maliyet etkindir. Üstelik bu içeriklerin dijital reklamlardaki (Meta Ads, Google vb.) tıklanma ve dönüşüm maliyetleri (CPA), standart reklamlara kıyasla %50''ye varan oranlarda daha düşüktür.</p>
    ', '4 dk okuma', 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&q=80&w=800', '2026-05-11T15:12:18.638Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (4, 'sosyal-medya-yonetiminde-stratejik-faktorler', 'Sosyal Medya Yönetiminde Stratejik Faktörler', 'Dijital dünyada görünür olmak artık tek başına yeterli değil. Markalar için asıl fark yaratan unsur, stratejik ve planlı bir sosyal medya yönetimidir...', '
      <h2>Stratejisiz Paylaşımlar Zaman Kaybıdır</h2>
      <p>Dijital dünyada görünür olmak artık tek başına yeterli değil. Markalar için asıl fark yaratan unsur, stratejik sosyal medya yönetimidir. Plansız paylaşımlar kısa vadede etkileşim getirebilir; ancak uzun vadede marka algısı, güven ve satışa dönüşen sonuçlar ancak doğru bir stratejiyle mümkün olur.</p>
      
      <h2>1. Net ve Ölçülebilir Hedefler Belirlemek</h2>
      <p>Sosyal medya yönetimine başlamadan önce hedefler net yanıtlanmalıdır: Marka bilinirliği mi artırılacak? Potansiyel müşteri mi toplanacak? Satış mı hedefleniyor? Hedefi belli olmayan bir gemiye hiçbir rüzgar yardım edemez.</p>
      
      <h2>2. Hedef Kitle Analizi ve Doğru Platform Seçimi</h2>
      <p>Her içerik herkes için değildir. Genç ve dinamik bir kitleye ulaşmak istiyorsanız Instagram ve YouTube Shorts üzerinde durmalısınız. Eğer B2B (şirketten şirkete) bir hizmet satıyorsanız odak noktanız LinkedIn olmalıdır. Doğru platform seçimi reklam bütçenizin boşa gitmesini engeller.</p>
      
      <h2>3. Veri Analizi ve Sürekli Optimizasyon</h2>
      <p>Sosyal medya durağan değil, dinamiktir. Her ay sonu veriler incelenmeli; "Hangi içerik daha çok kaydedildi?", "Hangi reklam seti daha ucuz maliyet getirdi?" gibi soruların cevaplarıyla bir sonraki ayın stratejisi güncellenmelidir.</p>
    ', '3 dk okuma', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800', '2026-05-11T15:12:18.800Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (16, '13socialartbesttimestopostoninstagram', '<![CDATA[(13) ⏰ Socialart Best Times to Post on Instagram]]>', '<![CDATA[Instagram post times directly impact engagement rates for businesses. Learn the best hours with this guide, increase your visibility.]]>...', '
          <p><![CDATA[Instagram post times directly impact engagement rates for businesses. Learn the best hours with this guide, increase your visibility.]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://static.wixstatic.com/media/7771b0_ef0df28897604460974d92013dacb655~mv2.png/v1/fit/w_1000,h_1000,al_c,q_80/file.png', '2025-06-08T05:18:16.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (5, 'nedenurununuzusunucucekimiileanlatmalisiniz', '<![CDATA[Neden Ürününüzü Sunucu Çekimi ile Anlatmalısınız? ]]>', '<![CDATA[Dijital dünyada kullanıcıların dikkat süresi her geçen gün azalıyor. Bir ürün ne kadar kaliteli olursa olsun, doğru anlatılmadığında hedef ki...', '
          <p><![CDATA[Dijital dünyada kullanıcıların dikkat süresi her geçen gün azalıyor. Bir ürün ne kadar kaliteli olursa olsun, doğru anlatılmadığında hedef kitlesine ulaşması zorlaşıyor. Özellikle sosyal medya reklamları, web siteleri ve performans pazarlama süreçlerinde artık sadece ürün göstermek yeterli olmuyor. Kullanıcı ürünün ne işe yaradığını, neden güvenilir olduğunu ve hayatına nasıl katkı sağlayacağını görmek istiyor. Tam da bu noktada sunucu çekimleri markalar için güçlü bir pazarlama aracına...]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800', '2026-05-08T13:33:10.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (6, 'restoraninizisosyalmedyareklamveproduksiyonilebuyutun', '<![CDATA[Restoranınızı Sosyal Medya, Reklam ve Prodüksiyon ile Büyütün!]]>', '<![CDATA[Günümüzde restoranların başarısı yalnızca lezzetle ölçülmüyor. Müşteriler, bir mekâna gitmeden önce Instagram ve TikTok hesaplarını inceliyor...', '
          <p><![CDATA[Günümüzde restoranların başarısı yalnızca lezzetle ölçülmüyor. Müşteriler, bir mekâna gitmeden önce Instagram ve TikTok hesaplarını inceliyor, yorumları okuyor ve mekânın atmosferini dijital ortamdan değerlendiriyor. İşte bu noktada restoran sosyal medya yönetimi, sosyal medya reklam ve prodüksiyon hizmeti, markaların öne çıkması için kritik bir rol oynuyor. Doğru strateji ve profesyonel içerik ile sosyal medya, restoranların müşteri kazanma, marka bilinirliği artırma ve satışları yükseltme...]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800', '2026-03-16T10:42:53.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (7, 'markalarnedenugcureticileriilecalismalisatislariartiranicerikstratejisiningucu', '<![CDATA[Markalar Neden UGC Üreticileri ile Çalışmalı? Satışları Artıran İçerik Stratejisinin Gücü]]>', '<![CDATA[Dijital pazarlamada tüketici davranışları son yıllarda köklü şekilde değişti. Kullanıcılar artık klasik reklamlardan çok gerçek insanların de...', '
          <p><![CDATA[Dijital pazarlamada tüketici davranışları son yıllarda köklü şekilde değişti. Kullanıcılar artık klasik reklamlardan çok gerçek insanların deneyimlerine güveniyor. Bu değişimle birlikte UGC (User Generated Content – Kullanıcı Tarafından Üretilen İçerik), markalar için en etkili büyüme araçlarından biri haline geldi. Özellikle sosyal medya algoritmaları ve yapay zeka destekli içerik öneri sistemleri, doğal ve samimi görünen içerikleri daha fazla kullanıcıya ulaştırıyor. Bu nedenle markaların...]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800', '2026-02-25T12:30:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (18, 'sosyalmedyadaduygusaltetikleyicilerlesatisartirmak2025psikolojikpazarlamatrendleri', '<![CDATA[️ Sosyal Medyada Duygusal Tetikleyicilerle Satış Artırmak: 2025 Psikolojik Pazarlama Trendleri]]>', '<![CDATA[Socialart Ajans ile 2025 psikolojik pazarlama trendlerine uygun duygusal tetikleyicili sosyal medya stratejileriyle dönüşüm oranlarını artırı...', '
          <p><![CDATA[Socialart Ajans ile 2025 psikolojik pazarlama trendlerine uygun duygusal tetikleyicili sosyal medya stratejileriyle dönüşüm oranlarını artırın.]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://static.wixstatic.com/media/7771b0_063d9279b12543d1927b1a1570cca33a~mv2.png/v1/fit/w_1000,h_1000,al_c,q_80/file.png', '2025-05-29T06:57:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (8, 'sosyalmedyayonetimindestratejikfaktorlermarkalaricinsurdurulebilirbasarirehberi', '<![CDATA[Sosyal Medya Yönetiminde Stratejik Faktörler Markalar İçin Sürdürülebilir Başarı Rehberi]]>', '<![CDATA[Dijital dünyada görünür olmak artık tek başına yeterli değil. Markalar için asıl fark yaratan unsur, stratejik sosyal medya yönetimi . Plansı...', '
          <p><![CDATA[Dijital dünyada görünür olmak artık tek başına yeterli değil. Markalar için asıl fark yaratan unsur, stratejik sosyal medya yönetimi . Plansız paylaşımlar kısa vadede etkileşim getirebilir; ancak uzun vadede marka algısı, güven ve satışa dönüşen sonuçlar ancak doğru bir stratejiyle mümkün olur. 1. Net ve Ölçülebilir Hedefler Belirlemek Sosyal medya yönetimine başlamadan önce şu sorular net yanıtlanmalıdır: Marka bilinirliği mi artırılmak isteniyor? Potansiyel müşteri (lead) mi toplanacak?...]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800', '2026-02-12T08:26:17.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (9, 'reklamlarincalismamasibazencokiyibirseydir', '<![CDATA[Reklamların Çalışmaması Bazen Çok İyi Bir Şeydir!]]>', '<![CDATA[Çoğu marka için “reklam çalışmıyor” cümlesi panik sebebidir.Bütçe artırılır, kreatif değiştirilir, ajans sorgulanır. Ama çok az kişi şunu sor...', '
          <p><![CDATA[Çoğu marka için “reklam çalışmıyor” cümlesi panik sebebidir.Bütçe artırılır, kreatif değiştirilir, ajans sorgulanır. Ama çok az kişi şunu sorar: Ya sorun reklam değilse? İyi haber şu:Reklamların çalışmaması bazen kötü bir sonuç değil, erken uyarı sistemidir . Reklam Neden Gerçek Problemi Ortaya Çıkarır? Reklam, markanın aynasıdır.Ne  söylediğinizi, nasıl söylediğinizi ve kime söylediğinizi büyüterek gösterir. Eğer reklamdan sonuç gelmiyorsa, genelde şu üç alandan biri sorunludur: Marka dili...]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://static.wixstatic.com/media/7771b0_cb6973df48bc4482808f6a7fdd48e70b~mv2.jpeg/v1/fit/w_1000,h_1000,al_c,q_80/file.png', '2026-01-30T18:33:24.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (10, '2025psikolojikpazarlamateknikleriiledijitaldeetkilesimvesatislariartirin', '<![CDATA[ 2025 Psikolojik Pazarlama Teknikleri ile Dijitalde Etkileşim ve Satışları Artırın]]>', '<![CDATA[2025 psikolojik pazarlama teknikleri ile kullanıcıların bilinçaltına hitap edin. Empati, kıtlık, aidiyet ve sosyal kanıt stratejileriyle satı...', '
          <p><![CDATA[2025 psikolojik pazarlama teknikleri ile kullanıcıların bilinçaltına hitap edin. Empati, kıtlık, aidiyet ve sosyal kanıt stratejileriyle satışları artırın.
]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800', '2025-09-29T14:55:42.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (11, '2025sosyalkanitstratejisinedenreklamlarinenguclusilahiolacak', '<![CDATA[ 2025 Sosyal Kanıt Stratejisi Neden Reklamların En Güçlü Silahı Olacak?]]>', '<![CDATA[2025 sosyal kanıt stratejisi ile markalar güven kazanıyor. Kullanıcı yorumları, video referanslar ve anket sonuçları reklamlardan daha ikna e...', '
          <p><![CDATA[2025 sosyal kanıt stratejisi ile markalar güven kazanıyor. Kullanıcı yorumları, video referanslar ve anket sonuçları reklamlardan daha ikna edici.]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800', '2025-09-22T17:46:40.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (12, '2025sosyalmedyareklamlarinereyegidiyormetatiktokyoutube', '<![CDATA[ 2025 Sosyal Medya Reklamları Nereye Gidiyor? (Meta, TikTok, YouTube)]]>', '<![CDATA[2025 sosyal medya reklamları Meta, TikTok ve YouTube’da nasıl değişiyor? AI destekli hedefleme, kısa videolar ve mesajlaşma reklamlarını keşf...', '
          <p><![CDATA[2025 sosyal medya reklamları Meta, TikTok ve YouTube’da nasıl değişiyor? AI destekli hedefleme, kısa videolar ve mesajlaşma reklamlarını keşfedin.]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800', '2025-09-21T16:54:46.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (13, 'yapayzekicerikuretimindeneredebirakmalineredeajansdestegialmali', '<![CDATA[Yapay Zekâ İçerik Üretiminde Nerede Bırakmalı, Nerede Ajans Desteği Almalı?]]>', '<![CDATA[Yapay zekâ içerik üretiminde nerede yeterli, nerede ajans desteği gerekli? 2025 için dengeyi öğrenin ve markanızı öne çıkarın.
]]>...', '
          <p><![CDATA[Yapay zekâ içerik üretiminde nerede yeterli, nerede ajans desteği gerekli? 2025 için dengeyi öğrenin ve markanızı öne çıkarın.
]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800', '2025-09-20T18:02:54.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (14, '2025temarkalaricinsosyalmedyaiceriktakviminasilsekillenecek', '<![CDATA[2025’te Markalar İçin Sosyal Medya İçerik Takvimi Nasıl Şekillenecek?]]>', '<![CDATA[2025 sosyal medya içerik takvimi ile markanızı öne çıkarın. Yapay zeka trendleri, mevsimsel içerikler ve veri odaklı planlamayla etkileşimi a...', '
          <p><![CDATA[2025 sosyal medya içerik takvimi ile markanızı öne çıkarın. Yapay zeka trendleri, mevsimsel içerikler ve veri odaklı planlamayla etkileşimi artırın.]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800', '2025-09-17T13:37:21.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (15, '14socialartcommonsocialmediamistakesandhowtoavoidthem', '<![CDATA[ (14) Socialart Common Social Media Mistakes and How to Avoid Them]]>', '<![CDATA[Social media mistakes can damage your brand’s reputation and engagement. Discover the most common issues and how to fix them with Socialart.]...', '
          <p><![CDATA[Social media mistakes can damage your brand’s reputation and engagement. Discover the most common issues and how to fix them with Socialart.]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://static.wixstatic.com/media/7771b0_16b468f2d13b4002919f41b5bd45fb7c~mv2.png/v1/fit/w_1000,h_1000,al_c,q_80/file.png', '2025-06-08T05:29:50.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (17, 'musteriyorumlarindankampanyauretmeksosyalkanitingucu', '<![CDATA[ Müşteri Yorumlarından Kampanya Üretmek: Sosyal Kanıtın Gücü]]>', '<![CDATA[Socialart Ajans ile sosyal kanıt odaklı içeriklerle 2025''te kampanya dönüşüm oranlarınızı artırın, müşteri yorumlarını güce dönüştürün.]]>...', '
          <p><![CDATA[Socialart Ajans ile sosyal kanıt odaklı içeriklerle 2025''te kampanya dönüşüm oranlarınızı artırın, müşteri yorumlarını güce dönüştürün.]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://static.wixstatic.com/media/7771b0_7329ec6b0e6a493a83d92a2a57411c58~mv2.png/v1/fit/w_1000,h_1000,al_c,q_80/file.png', '2025-05-30T06:19:44.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (19, '2025tegorseldonusumcarouselinfografikvehareketliicerik', '<![CDATA[️ 2025’te Görsel Dönüşüm: Carousel, Infografik ve Hareketli İçerik]]>', '<![CDATA[Socialart Medya ile 2025’te görsel dönüşüm trendlerine uygun carousel, infografik ve hareketli içeriklerle etkileşim oranınızı artırın.]]>...', '
          <p><![CDATA[Socialart Medya ile 2025’te görsel dönüşüm trendlerine uygun carousel, infografik ve hareketli içeriklerle etkileşim oranınızı artırın.]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://static.wixstatic.com/media/7771b0_e0d1cea9b070461aae27ba6602e72be4~mv2.png/v1/fit/w_1000,h_1000,al_c,q_80/file.png', '2025-05-28T05:30:00.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (20, 'algoritmaanlayisindanalgoritmakullaniciligina2025temarkalaricinyenidonem', '<![CDATA[ Algoritma Anlayışından Algoritma Kullanıcılığına: 2025’te Markalar İçin Yeni Dönem]]>', '<![CDATA[Socialart Medya algoritma kullanıcılığı stratejileri ile 2025’te veriyi izlemekle yetinmeyin, algoritmalarla karar alan markalar arasına giri...', '
          <p><![CDATA[Socialart Medya algoritma kullanıcılığı stratejileri ile 2025’te veriyi izlemekle yetinmeyin, algoritmalarla karar alan markalar arasına girin.]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://static.wixstatic.com/media/7771b0_6f750f5cd45e4020a401d0981f5aac07~mv2.png/v1/fit/w_1000,h_1000,al_c,q_80/file.png', '2025-05-27T09:32:25.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (21, '2025tevideoduzenlemeninyenidonemiyapayzekadestekliaraclarlaicerikuretimi', '<![CDATA[ 2025’te Video Düzenlemenin Yeni Dönemi: Yapay Zeka Destekli Araçlarla İçerik Üretimi]]>', '<![CDATA[Socialart Medya yapay zeka destekli video düzenleme stratejisi ile 2025’te daha hızlı, yaratıcı ve etkili içerikler üretin.]]>...', '
          <p><![CDATA[Socialart Medya yapay zeka destekli video düzenleme stratejisi ile 2025’te daha hızlı, yaratıcı ve etkili içerikler üretin.]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://static.wixstatic.com/media/7771b0_294304c24a864c279d9cd506fe9b7189~mv2.png/v1/fit/w_1000,h_1000,al_c,q_80/file.png', '2025-05-26T10:07:59.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (22, '2025tesosyalmedyadayenidonemseslivegorselaramaentegrasyonlari', '<![CDATA[2025’te Sosyal Medyada Yeni Dönem: Sesli ve Görsel Arama Entegrasyonları]]>', '<![CDATA[Socialart Medya sesli ve görsel arama stratejisi ile içeriklerinizi keşfedilebilir hale getirin, sosyal medyada yeni arama alışkanlıklarına u...', '
          <p><![CDATA[Socialart Medya sesli ve görsel arama stratejisi ile içeriklerinizi keşfedilebilir hale getirin, sosyal medyada yeni arama alışkanlıklarına uyum sağlayın.]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://static.wixstatic.com/media/7771b0_92c0fb216ad8456abe129c3c438fa187~mv2.png/v1/fit/w_1000,h_1000,al_c,q_80/file.png', '2025-05-24T06:02:19.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (23, 'kurumsalmarkalaricin2025lokasyonbazlipazarlamarehberi', '<![CDATA[Kurumsal Markalar İçin 2025 Lokasyon Bazlı Pazarlama Rehberi]]>', '<![CDATA[Socialart Medya lokasyon bazlı pazarlama stratejisi ile 2025’te hedef kitlenize daha etkili ve yerel odaklı kampanyalarla ulaşın.]]>...', '
          <p><![CDATA[Socialart Medya lokasyon bazlı pazarlama stratejisi ile 2025’te hedef kitlenize daha etkili ve yerel odaklı kampanyalarla ulaşın.]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://static.wixstatic.com/media/7771b0_a7aab3ace3324a1daf505f305645f5f0~mv2.png/v1/fit/w_1000,h_1000,al_c,q_80/file.png', '2025-05-23T05:20:04.000Z') ON CONFLICT DO NOTHING;
INSERT INTO "blogs" ("id", "slug", "title", "excerpt", "content", "read_time", "cover_image", "created_at") VALUES (24, 'kulturelzekstratejisiilemarkailetisiminiguclendirin2025tesosyalmedyadaetkiliolmaninyollari', '<![CDATA[Kültürel Zekâ Stratejisi ile Marka İletişimini Güçlendirin: 2025''te Sosyal Medyada Etkili Olmanın Yolları]]>', '<![CDATA[Socialart Medya kültürel zekâ stratejisi ile içeriklerinizi daha empatik, daha kapsayıcı ve daha etkili hale getirin. Şimdi bizimle iletişime...', '
          <p><![CDATA[Socialart Medya kültürel zekâ stratejisi ile içeriklerinizi daha empatik, daha kapsayıcı ve daha etkili hale getirin. Şimdi bizimle iletişime geçin!]]></p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        ', '3 dk okuma', 'https://static.wixstatic.com/media/7771b0_ee9d50715e784c0fbaca5050cabf4b46~mv2.png/v1/fit/w_1000,h_1000,al_c,q_80/file.png', '2025-05-22T07:05:21.000Z') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_name" text NOT NULL,
  "message" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now()
);

INSERT INTO "chat_messages" ("id", "user_name", "message", "created_at") VALUES ('d40e5e68-3a8f-4c2f-bc0f-0987d4763fbb', 'Ercan', 'ıj9jo', '2026-04-08T09:52:54.325Z') ON CONFLICT DO NOTHING;
INSERT INTO "chat_messages" ("id", "user_name", "message", "created_at") VALUES ('efaa4f29-d051-476b-98e6-9232ee01e64f', 'Celal', 'merhaba', '2026-04-08T10:14:57.645Z') ON CONFLICT DO NOTHING;
INSERT INTO "chat_messages" ("id", "user_name", "message", "created_at") VALUES ('ae76fb23-3c90-4dbb-bda1-e06211dfeaeb', 'Furkan', 'deneme', '2026-04-11T07:45:37.934Z') ON CONFLICT DO NOTHING;
INSERT INTO "chat_messages" ("id", "user_name", "message", "created_at") VALUES ('9a76af3f-39e0-4e66-bab0-5bbd9c8f8ef6', 'Furkan', 'deneme', '2026-04-13T08:29:22.284Z') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "client_support_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_name" text NOT NULL,
  "message" text NOT NULL,
  "sender_type" text NOT NULL,
  "admin_name" text,
  "is_read" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);


CREATE TABLE IF NOT EXISTS "clients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "marka_adi" text NOT NULL,
  "yetkili_kisi" text,
  "durum" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);


CREATE TABLE IF NOT EXISTS "customer_accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_name" text NOT NULL,
  "company_code" text NOT NULL,
  "password" text NOT NULL,
  "metrics" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

INSERT INTO "customer_accounts" ("id", "client_name", "company_code", "password", "metrics", "created_at") VALUES ('56b54823-eafc-49b8-9da1-0f147cb848ec', 'PEUGEOT Turkey', 'PEUGEOT2026', 'socialart2026', '{"roas":"7.5","reach":"1.2M","growth":"+12%","ad_spend":"₺85.000","followers":"450K"}', '2026-04-08T09:23:01.718Z') ON CONFLICT DO NOTHING;
INSERT INTO "customer_accounts" ("id", "client_name", "company_code", "password", "metrics", "created_at") VALUES ('adc9f8bb-dbac-433b-bffb-163edb67676d', 'Döner Evim Pendik', 'DONEREVIMPENDIK2026', 'socialart2026', '{"roas":"---","ad_spend":"---","followers":"---","engagement":"---"}', '2026-04-08T10:21:26.079Z') ON CONFLICT DO NOTHING;
INSERT INTO "customer_accounts" ("id", "client_name", "company_code", "password", "metrics", "created_at") VALUES ('56ee8c44-782c-4411-9fc2-b37d205e104b', 'Karadeniz Et Lokantası', 'KARADENIZETLOKANTASI2026', 'socialart2026', '{"roas":"---","ad_spend":"---","followers":"---","engagement":"---"}', '2026-04-08T10:21:26.253Z') ON CONFLICT DO NOTHING;
INSERT INTO "customer_accounts" ("id", "client_name", "company_code", "password", "metrics", "created_at") VALUES ('977fa518-02b9-448e-be8f-4f126073f103', 'Gurme Bahçeşehir', 'GURMEBAHCESEHIR2026', 'socialart2026', '{"roas":"---","ad_spend":"---","followers":"---","engagement":"---"}', '2026-04-08T10:21:26.409Z') ON CONFLICT DO NOTHING;
INSERT INTO "customer_accounts" ("id", "client_name", "company_code", "password", "metrics", "created_at") VALUES ('15414e4d-5bad-4b80-9f4e-e1e3e2ae1901', 'Mall Of Gurme', 'MALLOFGURME2026', 'socialart2026', '{"roas":"---","ad_spend":"---","followers":"---","engagement":"---"}', '2026-04-08T10:21:26.566Z') ON CONFLICT DO NOTHING;
INSERT INTO "customer_accounts" ("id", "client_name", "company_code", "password", "metrics", "created_at") VALUES ('7db92490-1d16-4628-8785-75ec63cf7020', 'Socketta', 'SOCKETTA2026', 'socialart2026', '{"roas":"---","ad_spend":"---","followers":"---","engagement":"---"}', '2026-04-08T10:21:26.722Z') ON CONFLICT DO NOTHING;
INSERT INTO "customer_accounts" ("id", "client_name", "company_code", "password", "metrics", "created_at") VALUES ('d1bb1835-e201-4714-bc74-248709b7cf23', 'VIP Catring', 'VIPCATRING2026', 'socialart2026', '{"roas":"---","ad_spend":"---","followers":"---","engagement":"---"}', '2026-04-08T10:21:26.878Z') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "email_marketing_leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL,
  "name" text,
  "source" text,
  "status" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "last_synced_at" timestamp with time zone
);

INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('20aa8d94-447c-4ba4-a84b-6831d1164af4', 'info@ortadoguholding.com.tr', '', 'CSV Upload', 'active', '2026-05-07T08:15:14.995Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('4a0fd960-044b-4f86-939f-fa3b50ab0a81', 'info@karamanci.com', '', 'CSV Upload', 'active', '2026-05-07T08:15:14.995Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('bb81d8b5-8a7b-4137-8e33-b9fb88f008ff', 'info@suzer.com', '', 'CSV Upload', 'active', '2026-05-07T08:15:14.995Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('6e96a852-5641-4e8a-a128-5a1ad682cdc9', 'info@nevco.com.tr', '', 'CSV Upload', 'active', '2026-05-07T08:15:14.995Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('fbfcc139-07c3-42ae-9eed-60029124ceba', 'info@denizholdinggroup.com', '', 'CSV Upload', 'active', '2026-05-07T08:15:14.995Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('5dcb74e5-b294-4787-9e3c-0e0dbceb7a77', 'info@acme.com.tr', '', 'CSV Upload', 'active', '2026-05-07T08:15:14.995Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('3e235920-2bad-4f8a-a8c9-e284f171cb97', 'info@honestholding.com.tr', '', 'CSV Upload', 'active', '2026-05-07T08:15:19.859Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('21ea3a02-93da-445e-8665-557ecca7e792', 'info@avm.com.tr', '', 'CSV Upload', 'active', '2026-05-07T08:15:19.859Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('de62bc4f-cc61-46ce-9e38-10ac551f250c', 'info@calik.com', '', 'CSV Upload', 'active', '2026-05-07T08:15:19.859Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('e0d1cc34-fe76-4522-bec4-9c786b6c6549', 'info@kandilliholding.com', '', 'CSV Upload', 'active', '2026-05-07T08:15:19.859Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('9cb49a57-8d84-48d5-a2d5-3d93a574ced7', 'okan@okan.com.tr', '', 'CSV Upload', 'active', '2026-05-07T08:15:19.859Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('1ad5e24b-ba60-454d-a3c2-c2b7ce399e50', 'iletisim@ihlas.com.tr', '', 'CSV Upload', 'active', '2026-05-07T08:15:19.859Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('2e8215c0-8fd1-4546-9336-d56dba5c0614', 'info@kucuklerholding.com', '', 'CSV Upload', 'active', '2026-05-07T08:15:19.859Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('8762a067-4231-48a7-8c14-149a6f7fd8c3', 'info@yapiholding.com.tr', '', 'CSV Upload', 'active', '2026-05-07T08:15:19.859Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('af170841-016a-4ca0-93c0-962f30a07310', 'info@sabanci.com', '', 'CSV Upload', 'active', '2026-05-07T08:15:25.911Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('1cfaad7e-bfc3-491f-8e91-1bdbedbcb1f6', 'info@tanholding.com.tr', '', 'CSV Upload', 'active', '2026-05-07T08:15:25.911Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('ba6a10eb-bf3c-44cc-b8b4-80dded2d7ad9', 'kvkk-atttekstil@turkmen.com', '', 'CSV Upload', 'active', '2026-05-07T08:15:25.911Z', NULL) ON CONFLICT DO NOTHING;
INSERT INTO "email_marketing_leads" ("id", "email", "name", "source", "status", "created_at", "last_synced_at") VALUES ('ae3f2174-1d5b-4779-8a38-c561d3ec83ff', 'info@erenholding.com.tr', '', 'CSV Upload', 'active', '2026-05-07T08:15:25.911Z', NULL) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "employees" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "isim" text NOT NULL,
  "rol" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);


CREATE TABLE IF NOT EXISTS "influencer_applications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone DEFAULT now(),
  "full_name" text NOT NULL,
  "phone" text NOT NULL,
  "email" text NOT NULL,
  "instagram_url" text NOT NULL,
  "followers_count" text,
  "niche" text,
  "about" text,
  "status" text
);


CREATE TABLE IF NOT EXISTS "job_applications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone DEFAULT now(),
  "full_name" text NOT NULL,
  "phone" text NOT NULL,
  "email" text NOT NULL,
  "position" text NOT NULL,
  "portfolio_url" text,
  "resume_url" text,
  "about" text,
  "status" text
);

INSERT INTO "job_applications" ("id", "created_at", "full_name", "phone", "email", "position", "portfolio_url", "resume_url", "about", "status") VALUES ('70f6783a-5881-4493-b443-307ac60ff03a', '2026-05-11T09:02:36.432Z', 'Test Job', '05559876543', 'testjob@example.com', 'Video Editor', 'https://test.com', NULL, 'This is a test job application.', 'Bekliyor') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "lead_history" (
  "id" bigint PRIMARY KEY,
  "lead_id" bigint,
  "note" text NOT NULL,
  "type" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "author_name" text,
  "attachment_url" text,
  "file_name" text
);

INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('42', '20', 'Durum güncellendi: Düşük Kalite', 'durum_degisikligi', '2026-04-13T10:10:28.045Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('5', '5', 'Sisteme eklendi: "Fiyat teklifi hazırlanıyor"', 'not', '2026-04-08T08:35:06.575Z', 'Sistem', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('43', '21', 'Sisteme eklendi: "İşletmeniz hakkında daha fazla bilgi alabilir miyim?
"', 'not', '2026-04-13T10:12:05.533Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('44', '21', 'Merhabalar, tabii ki. Sizleri hangi hizmetlerimiz ile ilgili bilgilendirelim?
', 'not', '2026-04-13T10:12:13.543Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('8', '5', 'Durum güncellendi: Anlaşıldı', 'durum_degisikligi', '2026-04-09T10:58:30.244Z', 'Sistem', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('9', '5', 'Durum güncellendi: Beklemede', 'durum_degisikligi', '2026-04-09T10:58:52.407Z', 'Sistem', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('10', '6', 'Sisteme eklendi: "Instagram DM üzerinden fiyat teklifi iletildi."', 'not', '2026-04-09T19:41:20.868Z', 'Sistem', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('45', '21', 'Durum güncellendi: Düşük Kalite', 'durum_degisikligi', '2026-04-13T10:12:22.620Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('46', '22', 'Sisteme eklendi: "Konuşabileceğim müsait biri var mı?
"', 'not', '2026-04-13T10:13:27.699Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('47', '22', 'Arzu Hanım merhaba, hangi hizmetlerimiz ile ilgileniyorsunuz? ', 'not', '2026-04-13T10:13:43.176Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('15', '6', 'Düşüneceğiz cevabı geldi', 'not', '2026-04-09T19:46:49.148Z', 'Sistem', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('18', '5', 'Diğer ajanslardan fiyat teklifi bekliyor', 'not', '2026-04-10T08:38:15.846Z', 'Sistem', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('48', '22', 'Merhaba. Hizmetleriniz hakkında bilgi almqk istiyorum.
Hesap yönetimi hizmetiniz var mı?', 'not', '2026-04-13T10:13:51.786Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('27', '16', 'Sisteme eklendi: "13.04.26 tarihinde arayacağı bilgisi verildi. Önce whatsapptan bilgi geçilmesini istedi."', 'not', '2026-04-13T09:48:53.204Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('28', '17', 'Sisteme eklendi: "İşletmeniz hakkında daha fazla bilgi alabilir miyim?
"', 'not', '2026-04-13T09:58:11.606Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('29', '17', 'Merhabalar tabii ki, sizlere hizmetlerimiz hakkında bilgilendirme yapmak isterim. Sunucu hizmeti mi almak istiyorsunuz?', 'not', '2026-04-13T09:58:23.285Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('30', '17', 'Durum güncellendi: Düşük Kalite', 'durum_degisikligi', '2026-04-13T09:58:29.901Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('31', '18', 'Sisteme eklendi: "İşletmeniz hakkında daha fazla bilgi alabilir miyim?
"', 'not', '2026-04-13T09:59:22.606Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('32', '18', 'Merhabalar ben Socialart Ajans’tan Tuğba 😇￼', 'not', '2026-04-13T09:59:31.831Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('33', '18', 'Sizleri hangi hizmetlerimiz ile ilgili bilgilendirelim?', 'not', '2026-04-13T09:59:39.274Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('34', '18', 'Durum güncellendi: Düşük Kalite', 'durum_degisikligi', '2026-04-13T09:59:53.878Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('35', '19', 'Sisteme eklendi: "İşletmeniz hakkında daha fazla bilgi alabilir miyim?"', 'not', '2026-04-13T10:00:43.542Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('36', '19', 'Merhabalar ben Socialart Ajans’tan Tuğba 😇', 'not', '2026-04-13T10:00:52.298Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('37', '19', 'Sizleri hangi hizmetlerimiz ile ilgili bilgilendirelim?
', 'not', '2026-04-13T10:00:57.106Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('38', '19', 'Durum güncellendi: Düşük Kalite', 'durum_degisikligi', '2026-04-13T10:01:03.522Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('39', '20', 'Sisteme eklendi: "İşletmeniz hakkında daha fazla bilgi alabilir miyim?"', 'not', '2026-04-13T10:09:54.957Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('40', '20', 'Merhabalar ben Socialart Ajans’tan Tuğba ', 'not', '2026-04-13T10:10:18.692Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('41', '20', 'Sizleri hangi hizmetlerimiz ile ilgili bilgilendirelim?
', 'not', '2026-04-13T10:10:22.693Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('49', '22', 'Evet Arzu Hanım, hesap yönetimi hizmetimiz bulunuyor. İsterseniz sizleri arayıp detaylı bilgilendirme sağlayalım.
', 'not', '2026-04-13T10:14:05.501Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('50', '23', 'Sisteme eklendi: "Telefon numarası paylaşma şansınız var mı acaba?
"', 'not', '2026-04-13T10:16:27.771Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('51', '16', 'aradım meşguldü tekrar arayacağım', 'not', '2026-04-15T10:21:47.016Z', 'Simge', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('53', '23', 'Müşteri geri dönüş yaptı mekan önerilerini konuştuk stüdyo dışında dış çekim istiyor bilgi verildi dönüş bekleniyor değerlendirecekmiş.', 'not', '2026-04-16T11:13:24.411Z', 'Celal', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('55', '24', 'Sisteme eklendi: "Sunuculu reklam videoları hakkında daha fazla bilgi alabilir miyim?
"', 'not', '2026-04-17T09:18:07.366Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('56', '24', 'Merhabalar, tabii ki. Dilerseniz iletişim numaranızı bizlerle paylaşın sizleri  arayalım. Taleplerinizi dinleyelim ve detaylı bilgilendirme sağlayalım ☺️🙏
', 'not', '2026-04-17T09:18:14.130Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('57', '24', '-müşteri telefon numarası iletti-
', 'not', '2026-04-17T09:18:29.327Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('58', '25', 'Sisteme eklendi: "Telefon numarası bekleniyor"', 'not', '2026-04-17T09:19:17.097Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('59', '26', 'Sisteme eklendi: "Merhaba, bugün üreticilerle görüşmek için şehir dışında olacağım. Size de uyarsa online görüşme ayarlayabilir miyiz pazartesine?
"', 'not', '2026-04-17T09:21:17.593Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('60', '27', 'Sisteme eklendi: "İletişim numarası iletti "', 'not', '2026-04-17T09:22:30.214Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('61', '28', 'Sisteme eklendi: "İletişim numarası alındı"', 'not', '2026-04-17T09:23:13.435Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('62', '28', 'kendisi ile görüştüm. https://www.instagram.com/turkiyesothebysrealty?igsh=MTAzYmp3OG9uOW94 bu gayrimenkul şirketinin franchising''ini işletiyorlar. olmak istedikleri bir sayfa var şu şekilde https://www.instagram.com/thejetbusiness?igsh=aHlib2ZkOTg2Y3Uy bunun için sosyal medya hizmeti ve prodüksiyon hizmeti istiyorlar. kendilerini bilgilendirdim. ekibi ile görüşecek online bir görüşme için takvim oluşturacağız.

not: yerleri Sarıyer''de.', 'not', '2026-04-18T08:35:55.678Z', 'Simge', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('63', '24', 'Selim Bey sıvı mum üretimi yapıyor. İşletmesi Bahçelievler’de, Şirinevler Metro çıkışında. 4 farklı mum çeşidi için sunuculu profesyonel bir çekim yaptırmak istiyor.

Teklif hazırlarken ürünlerin bize gönderilip ofiste çekim yapılması ve çekimin kendi ofisinde yapılması olmak üzere iki farklı fiyat seçeneği sunabilir miyiz?', 'not', '2026-04-18T08:37:35.340Z', 'Simge', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('64', '26', 'kendisi ile pazartesi 14:00''e toplantı ayarlandı.', 'not', '2026-04-18T08:39:53.506Z', 'Simge', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('65', '29', 'Sisteme eklendi: "kendisi aranacak."', 'not', '2026-04-18T08:41:58.803Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('66', '30', 'Sisteme eklendi: "kenndisini arayacağım."', 'not', '2026-04-18T08:42:34.162Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('67', '31', 'Sisteme eklendi: "aranacak"', 'not', '2026-04-18T08:43:25.302Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('68', '24', 'Durum güncellendi: Reddedildi', 'durum_degisikligi', '2026-04-20T08:03:37.135Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('69', '26', 'Görüşme gerçekleşti teklif sunumu iletilecek', 'not', '2026-04-21T10:27:05.357Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('70', '32', 'Sisteme eklendi: "Sunuculu reklam videoları hakkında daha fazla bilgi almak istedi dil kursu için "', 'not', '2026-04-21T10:33:13.630Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('71', '32', 'Telefon numarası bekleniyor', 'not', '2026-04-21T10:33:23.270Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('72', '31', 'Güneş enerji sistemleri üzerine hizmet veriyorum dedi. Paketleri incelemek istiyorum dedi iletiyorum', 'not', '2026-04-21T10:43:58.564Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('74', '5', 'Durum güncellendi: Reddedildi', 'durum_degisikligi', '2026-04-21T10:48:38.539Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('75', '23', 'Fiyat teklifi iletildi değerlendirecekler', 'not', '2026-04-21T14:45:06.196Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('76', '29', 'Telefonları açmıyor', 'not', '2026-04-22T10:09:02.178Z', 'Tuğba', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('77', '30', 'UGC Çalışması yapılacak', 'not', '2026-04-22T10:10:05.308Z', 'Tuğba', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('78', '22', 'Durum güncellendi: Düşük Kalite', 'durum_degisikligi', '2026-04-22T10:10:37.047Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('79', '26', 'Durum güncellendi: Sıcak', 'durum_degisikligi', '2026-04-22T10:10:43.249Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('80', '30', 'Durum güncellendi: Sıcak', 'durum_degisikligi', '2026-04-22T10:10:47.159Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('81', '25', 'Durum güncellendi: Düşük Kalite', 'durum_degisikligi', '2026-04-22T10:17:34.101Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('82', '33', 'Sisteme eklendi: "Akın Bey, lightbox tabelalar yapıyormuş. Kendisi web sitesine çok önem veriyor. Her şeyin belli bir düzende olmasını istiyor. O sebeple seo’yu bir ekibe, meta ve Google ada reklamlarını bir ekibe sosyal medyayı da bir ekibe vermek istiyor. Çok butik çalışmak istediğini söyledi. Bizim ajans sayfa düzenini çok beğenmiş öyle bir içerik bekliyor. Yani içerik akışında grafiklerden ziyade elinde olan argümanların düzenlenmesini istiyor. Bizim ajansımızı çok beğendiğini dile getirdi. 

Video çekimleri için ayrı konuşuruz dedi öncelikli olarak talebim sosyal medya yönetimi dedi. 

Bahçelievler’de yeri 
"', 'not', '2026-04-22T12:33:15.603Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('83', '33', 'Teklif bekliyor', 'not', '2026-04-22T12:33:21.419Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('84', '34', 'Sisteme eklendi: "Villa yenileme yapıyorlarmış düzenli çalışmak istiyor. İlk etapta stüdyoda çekim yapmak istediğini söyledi. 5 video ile başlarız birbirimizi tanırız dedi. Kendisine fiyat verdim ama 5 video için farklı bir fiyat veririz diye düşündüm o sebeple sizden teklif bekliyorum. 

Bu arada ısrarla videodaki sunucu kızın videoda yer almasını istiyorum mümkün mü dedi 


Yerleri çerkezköyde"', 'not', '2026-04-22T12:34:38.238Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('85', '34', '5 video için 30k teklif iletildi', 'not', '2026-04-22T14:30:17.285Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('87', '6', 'Durum güncellendi: Düşük Kalite', 'durum_degisikligi', '2026-04-23T15:41:57.734Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('88', '32', 'Durum güncellendi: Düşük Kalite', 'durum_degisikligi', '2026-04-23T15:42:04.680Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('89', '16', 'Durum güncellendi: Düşük Kalite', 'durum_degisikligi', '2026-04-23T15:42:42.073Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('90', '28', 'Durum güncellendi: Düşük Kalite', 'durum_degisikligi', '2026-04-23T15:43:09.028Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('91', '35', 'Sisteme eklendi: "Dubai merkezli bir şirketleri var turizm alanına yönelik yazılımlar geliştiriyorlar. Bu ürünleri Türkiye pazarına sunmayı planlıyorlar. Mustafa Bey’in ise Kağıthane’de ayrı bir ofisi bulunuyor. bu sayfa için 25-30 adet bandında sunuculu video çektirmek istiyorlar. çekilen videoları reklama çıkmak istiyorlar. o sebeple hem suncuulu video için teklif hem de sosyal medya için ayrı bir teklif hazırlayabilir miyiz?


teklifi ekip arkadaşları ile değerlendirip uygun bulurlarsa ofise gelecekler."', 'not', '2026-04-23T15:46:01.003Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('92', '35', 'Durum güncellendi: Sıcak', 'durum_degisikligi', '2026-04-23T15:46:04.404Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('96', '38', 'Sisteme eklendi: "webten form doldurdu"', 'not', '2026-04-25T14:14:32.135Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('97', '35', 'Mustafa bayrak’a teklif ileteceğiz. 25 video ücreti ve sosyal medya paketi olmak üzere 2 teklif hazırlayacağız. Beyfendi reklam hizmetini biz çalışıp ona para kazandırmaya başladıktan sonra vereceğini söyledi. Bende böyle bir şeyin mümkün olamayacağını izah ettim. Sadece reklamcı ile değil bir ekiple çalışacağını söyledim o da peki o zaman ben ayrı ayrı görebilir miyim anlaşırsak  Türkiye ayağını size veririz dedi', 'not', '2026-04-25T14:15:28.418Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('99', '34', 'Durum güncellendi: Sıcak', 'durum_degisikligi', '2026-04-25T14:20:56.793Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('100', '33', 'Durum güncellendi: Sıcak', 'durum_degisikligi', '2026-04-25T14:20:58.819Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('101', '39', 'Sisteme eklendi: "Yazılım hizmeti yapan bir adam. 3 sunuculu video olarak anlaşıldı."', 'not', '2026-04-27T08:06:29.806Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('102', '39', 'Durum güncellendi: Sıcak', 'durum_degisikligi', '2026-04-27T08:08:02.880Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('103', '33', 'Teklif iletildi', 'not', '2026-04-27T08:45:06.520Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('104', '23', 'Durum güncellendi: Reddedildi', 'durum_degisikligi', '2026-04-27T08:47:39.234Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('105', '40', 'Sisteme eklendi: "@designfloor / "', 'not', '2026-04-27T10:13:03.554Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('106', '41', 'Sisteme eklendi: "saç teli ile insanların hangi besine intoleransı olduğunu belirliyorlar. normalde diyetisyenlerle çalışıyorlarmış. ama bunu sosyal medyaya taşımak istediklerini söyledi. influencer, sunuculu video ve sosyal medya istiyor

haftaya ofis taraflarına geçecekmiş duruma göre uğrarım yanınıza dedi.  

yerleri beylikdüzünde"', 'not', '2026-04-28T14:29:33.342Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('107', '42', 'Sisteme eklendi: "eşi ve eşinin arkadaşı oyuncak satıyorlar. Lego markasının gibi ama markası lego olmayan oyuncaklar. bunun yapılış şekillerinin nasıl olduğunun anlatıldığı bir video çekimi istiyorlar. ayrıca sosyal medya hizmeti ile ilgili ilgilendiklerini söyledi. bende kendisine business paket önerdim. teklifi önden görelim uygun olur ise sizi yerinizde de görmek isteriz dediler"', 'not', '2026-04-30T11:54:00.401Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('108', '43', 'Sisteme eklendi: "Kendisinin kokulu mum ve oda kokusu üzere butik bir markası var hali hazırda bir ajans ile çalışıyor ama hiç memnun değil ürünümün anlatılmasını ve reklamla satış yapmak istiyorum dedi artık ajanslardan çok yoruldum beni anlamıyorlar dedi 😂 2 aydır çalışıyoruz ürün içerikleri bile doğru yazılmıyor dedi. Yerleri beykozdaymış ortağı Çekmeköy’deymiş sürekli gelip gittiğim bir yerdesiniz dedi. Kendisine business paket önerebiliriz diye düşünüyorum"', 'not', '2026-04-30T11:54:32.435Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('109', '27', 'Make up stüdyom var yeni açtım
İnstragram reklam veriyorum sadece ama yetersiz hissediyorum
', 'not', '2026-04-30T11:56:47.440Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('110', '29', 'yenileteknoloji.com
Yenile.co 
Nellpro.com
', 'not', '2026-04-30T11:57:36.316Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('111', '42', 'teklif bekliyorlar', 'not', '2026-04-30T11:59:58.715Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('112', '43', 'teklif bekliyorlar', 'not', '2026-04-30T12:00:06.108Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('113', '27', 'Stüdyosu daha açılmadı tekrar aranacak', 'not', '2026-04-30T12:13:24.652Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('114', '29', 'bir çok kez arandı uluşalımadı, tekrar aranacak', 'not', '2026-04-30T12:13:45.673Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('115', '30', 'bir çok kez arandı ve ulaşılamadı', 'not', '2026-04-30T12:14:11.649Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('116', '31', 'fiyatı çok yüksek buldular', 'not', '2026-04-30T12:14:27.763Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('117', '31', 'Durum güncellendi: Düşük Kalite', 'durum_degisikligi', '2026-04-30T12:14:37.277Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('118', '33', 'tekrar aranacak', 'not', '2026-04-30T12:14:55.036Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('119', '34', 'geri dönüş yapamdı', 'not', '2026-04-30T12:15:05.674Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('120', '35', 'çalışamaya başlayalım, lead sonrası para veririm dedi', 'not', '2026-04-30T12:15:46.718Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('121', '38', 'yanlış numara', 'not', '2026-04-30T12:16:03.343Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('122', '40', 'whatsapptan en yakın müsaitlik zamanına toplantı yapılacak', 'not', '2026-04-30T12:17:04.776Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('123', '41', 'Teklif iletilecek', 'not', '2026-04-30T12:17:12.671Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('124', '44', 'Sisteme eklendi: "siteden form doldurdu"', 'not', '2026-05-02T12:17:01.857Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('125', '45', 'Sisteme eklendi: "Merhaba, DJ tanıtım/trailer videosu yaptırmak istiyorum. 🎧 Video konsepti: DJ OKSHAN için cinematic / hype trailer Süre: 20–40 saniye Stil: karanlık, neon ışıklı, enerjik 🔥 Video akışı (çok önemli): Giriş (0–5 sn) Siyah ekran + “DJ OKSHAN” yazısı Yavaş zoom + glitch / flash efekti Build-up (5–20 sn) DJ konsolu, kulaklık, miks anları Hızlı kesitler (beat ile uyumlu) Işık efektleri (laser / strobe / club vibe) Drop (20–30 sn) En enerjik sahneler Kalabalık / eğlence hissi (varsa stock görüntü de olabilir) Yazı: “Music • Energy • Vibe” Final (son 5 sn) Büyük logo: DJ OKSHAN 🎧🪩 Alt yazı: “Book Now / Rezervasyon” 🎵 Müzik: EDM / Tech House / Festival style Drop’lu, enerjik bir parça 🎨 Stil: Siyah arka plan + neon mavi/kırmızı ışıklar Hızlı geçişler Sinematik / modern DJ promo hissi 📱 Kullanım: Instagram Reels TikTok WhatsApp status


Hangi hizmetlere ihtiyacın var?

Ses / müzik düzenlemeleri
Animasyon / görsel efekt
Montaj / kurgu / editing
Alt yazı
Seslendirme
Video & fotoğraf çekimi

Ne tür bir video düzenlenecek ?

Tanıtım videosu

Video uzunluğu ne kadar ?

1 dakika veya daha az
"', 'not', '2026-05-02T12:18:06.915Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('126', '46', 'Sisteme eklendi: "Fiyat çok yüksek geldi"', 'not', '2026-05-04T08:05:31.827Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('127', '47', 'Sisteme eklendi: "Sunuculu reklam videoları hakkında daha fazla bilgi alabilir miyim?
"', 'not', '2026-05-04T08:06:52.852Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('128', '35', 'Durum güncellendi: Reddedildi', 'durum_degisikligi', '2026-05-04T08:07:13.737Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('129', '38', 'Durum güncellendi: Düşük Kalite', 'durum_degisikligi', '2026-05-04T08:07:43.439Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('130', '48', 'Sisteme eklendi: "biz çok iyi bilinen bir japon markasının saç bakım serisini getirdik
TYol mağazamız açık adı shiseido studio ve IG hesabımız mystudiotr
hizmetlerinizle ilgili görüşmek istiyoruz
"', 'not', '2026-05-04T08:11:43.336Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('131', '49', 'Sisteme eklendi: "Merhaba Sosyal media yönetimiz hakkında bilgi alabilirmiyim
"', 'not', '2026-05-04T08:13:03.839Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('132', '49', 'Bilgi verildi ama görüldü attı tekrar iletişim kurulabilir', 'not', '2026-05-04T08:13:26.014Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('133', '50', 'Sisteme eklendi: "Sunuculu reklam videoları hakkında daha fazla bilgi alabilir miyim?
"', 'not', '2026-05-04T08:14:59.777Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('134', '50', 'buradan bilgilendirebilirmisiniz
ya da wp de üzerinden yazın lütfen
Zamansız aranmak istemiyorum

dedi en son sonrasında bir konuşma gerçekleşmedi', 'not', '2026-05-04T08:15:31.322Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('135', '51', 'Sisteme eklendi: "04.05.2026 tarihinde aranacak"', 'not', '2026-05-04T08:16:49.015Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('136', '52', 'Sisteme eklendi: "Sunuculu reklam videosu için yazdı 04.05.2026 tarihinde aranacak"', 'not', '2026-05-04T08:18:03.246Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('137', '53', 'Sisteme eklendi: "04.05.2026 tarihinde aranacak"', 'not', '2026-05-04T08:19:11.785Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('138', '43', 'teklif iletildi', 'not', '2026-05-04T08:32:54.247Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('139', '54', 'Sisteme eklendi: "40 güne dükkanları hazır. Zincir olma niyetleri var. Maltepe süreyya plajında. Life Style olmasını istiyor. Hikaye ve hissiyat üzerinden gidilmeli. Agresif büyüme gerekli. "', 'not', '2026-05-04T09:44:25.104Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('140', '54', 'Teklif İletildi', 'not', '2026-05-04T09:44:32.697Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('141', '55', 'Sisteme eklendi: "Kısa danışmanlık verildi. Müdürü ile görüşüp haber verecek. "', 'not', '2026-05-04T09:46:06.036Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('142', '42', 'Teklif iletildi', 'not', '2026-05-04T14:11:59.509Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('143', '56', 'Sisteme eklendi: "iç mimarlık ofisleri var yerleri pendikte, sosyal medya için çalıştığı bir ajans var reklam ve 4 adet sunuculu video çekim hizmeti almak istiyor. ben kendisine sosyal medya paketi almasını önerdim eğer uzun vadeli çalışmak isterse bu şekilde aylık sosyal medya hizmetinin kendileri için çok karlı olacağından bahsettim.
-Simge"', 'not', '2026-05-04T14:15:18.183Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('144', '56', ' o da 3 farklı şekilde teklif bekliyor.
', 'not', '2026-05-04T14:15:24.555Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('145', '48', 'Çok çok ünlü bir Japon markası olan shiseido markasının saç ürünlerini Japonya’dan getiren bir kadın. Kadına normalde shiseido Türkiye’de yokmuydu var dedim o da saç kısmı yok dedi bu tarafta agresif olarak büyğme ve satış istiyor. Meta ve seo tarafında hizmet istiyor Bizden öneri istiyor. Sosyal medya tarafında nasıl bir çalışma yapabilrşz şeklinde sayfaları çok kötü https://www.instagram.com/mystudiotr?igsh=MXFtc3Z0Y3hkMjEyMg== bu tarafta bu kadını yerinde de ziyaret edebilirsek çok iyi olur. Shiseido çok büyük ve çok oremium bir marka


https://ty.gl/dp7hghcgbhvpl Trendyol mağazası', 'not', '2026-05-04T14:16:28.260Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('146', '48', 'Buna strateji ve teklif hazırlanacak', 'not', '2026-05-04T14:16:34.209Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('147', '57', 'Sisteme eklendi: "Modellere saç makyaj yapıp çekim yaptırmak istiyor. "', 'not', '2026-05-04T15:56:58.392Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('148', '26', 'Başka yerle anlaşmış
', 'not', '2026-05-04T16:26:26.657Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('149', '40', 'Bugün teyitleşeceğiz
-Simge', 'not', '2026-05-04T16:32:21.018Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('150', '56', 'simge hanım arayıp ulaşamamış', 'not', '2026-05-04T16:33:39.011Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('151', '56', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-04T16:33:51.756Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('152', '54', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-04T16:34:26.832Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('153', '43', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-04T16:34:51.761Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('154', '41', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-04T16:34:56.446Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('155', '42', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-04T16:35:03.024Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('156', '40', 'ulaşılamamış', 'not', '2026-05-04T16:35:52.928Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('157', '41', 'Durum güncellendi: Teklif Bekliyor', 'durum_degisikligi', '2026-05-04T16:36:02.917Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('158', '48', 'Durum güncellendi: Teklif Bekliyor', 'durum_degisikligi', '2026-05-04T16:36:25.729Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('159', '58', 'Sisteme eklendi: "Telefon numarası iletti"', 'not', '2026-05-05T08:02:36.674Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('160', '59', 'Sisteme eklendi: "Telefon numarası iletti"', 'not', '2026-05-05T08:03:41.491Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('161', '50', '7.30 da arayabilirsiniz
dedi', 'not', '2026-05-05T08:04:18.724Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('162', '52', 'Ofise geldi konuştuk teklif bekliyor', 'not', '2026-05-05T08:05:12.707Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('163', '52', 'Durum güncellendi: Teklif Bekliyor', 'durum_degisikligi', '2026-05-05T08:05:17.927Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('164', '41', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-05T08:33:23.123Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('165', '48', 'Simge abla teklif hazırlıyor', 'not', '2026-05-05T08:33:32.180Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('166', '43', 'Başka firma ile anlaştı', 'not', '2026-05-05T14:54:10.498Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('167', '43', 'Durum güncellendi: Reddedildi', 'durum_degisikligi', '2026-05-05T14:54:16.438Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('168', '59', 'aradım açmadı
', 'not', '2026-05-05T15:22:10.317Z', 'Simge', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('169', '52', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-06T08:03:29.207Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('170', '52', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-06T08:37:21.378Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('171', '53', 'Yazılım şirketleri var. Teklif bekliyor. ', 'not', '2026-05-06T08:48:52.302Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('172', '53', 'Durum güncellendi: Teklif Bekliyor', 'durum_degisikligi', '2026-05-06T08:48:56.648Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('173', '47', 'Levent’te beyaz yakaların sürekli geldiği bir yer alkol ruhsatını henüz almamışlar. Profesyonel olsun ama resmi olmasın daha sıcak samimi içeriklerin yer aldığı bir sosyal medya ve reklam yönetimi ile bilinirliğinin arttığı bir hizmet istiyor. Burada nasıl bir paket önerelim businness uygun mudur? Teklif bekliyor kendisi', 'not', '2026-05-07T08:03:24.937Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('174', '60', 'Sisteme eklendi: "Kendilerinin mağazası var ataköyde stüdyomda çekim yapmak kıyaferimi tanıtmak istiyorum dedi video sayısı fazla olacak çünkü kadın ve erkek olarak iki grubumuz var dedi. Yarın müsaitseniz online bir görüşme yapmak istiyor"', 'not', '2026-05-07T08:06:31.273Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('175', '61', 'Sisteme eklendi: "Maltepe’de 10 gün içinde sanat atölyesi açıyor bir instagram hesabım yok burada sosyal medya hesabımın yönetilmesini istiyorum. İsmim markalaşsın hem kendi tablolarımı satayım hemde workshoplar düzenleyip müşteri çekebileyim diyor. Tatlı bir alan özellikle çocuklar için ailelerin çok fazla tercih edebileceği workshoplar var.
"', 'not', '2026-05-07T08:07:26.904Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('176', '61', 'Açılışın olduğu gün workshop düzenleyeceğiz burada hem bunu çekmenizi istiyorum hemde benimle röportaj tarzında bir video çekmenizi istiyorum dedi. Ama bu bir defaya mahsus dedi. ( ben onu video çekmeye ikna edebileceğimizi düşünüyorum) kendisi hemen bir yerle anlaşmak istiyor karar vericem artık dedi bende online toplantı talep ettim akşam 20.00 gibi müsait misiniz?', 'not', '2026-05-07T08:07:57.942Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('177', '62', 'Sisteme eklendi: "Kendi cilt bakım markası ürün premium sayfa akışım içeriklerim çok premium olsun istiyorum bu konuda hassasım diyor. Yeri bakırköyde. Kaliteli Ugcler ile içerik çalışmak istiyorum dedi. Burada  sunuculu videolarımızı kullanıcı videolarına çevirebilir miyiz? Örneğin cilt bakımı yaptığı, ürünü cildime uyguladığı bir video? Businness paket uygun geldi ancak kendisine iyi bir strateji hazırlanmalı özellikle prodüksiyon tarafında önerilere açık sizin yapabileceklerinizi de dinlemek istiyorum dedi
Aylık 30k reklam bütçesi var"', 'not', '2026-05-07T08:10:03.387Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('178', '48', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-07T08:12:41.501Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('179', '48', 'Ulaşılamıyor...', 'not', '2026-05-07T08:12:52.954Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('180', '48', 'Durum güncellendi: Reddedildi', 'durum_degisikligi', '2026-05-07T12:30:57.165Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('181', '61', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-09T09:25:59.154Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('182', '54', 'Daha inceleyememiş', 'not', '2026-05-09T09:26:19.914Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('183', '62', 'Durum güncellendi: Teklif Bekliyor', 'durum_degisikligi', '2026-05-09T09:26:54.899Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('184', '60', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-09T09:27:11.701Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('185', '60', 'Online görüşme için tekrar görüşülecek', 'not', '2026-05-09T09:27:36.753Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('186', '27', 'Durum güncellendi: Reddedildi', 'durum_degisikligi', '2026-05-09T09:30:00.045Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('187', '30', 'Durum güncellendi: Reddedildi', 'durum_degisikligi', '2026-05-09T09:31:21.115Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('188', '33', 'Durum güncellendi: Reddedildi', 'durum_degisikligi', '2026-05-09T09:31:35.687Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('189', '53', 'Toplantı için tarih verecekti dönüş yapmadı', 'not', '2026-05-11T09:09:15.630Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('190', '40', 'tekrar haberleşilecek', 'not', '2026-05-11T09:09:44.327Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('191', '63', 'Sisteme eklendi: "Fiyat listesi atıldı. "', 'not', '2026-05-11T09:12:15.174Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('192', '61', 'Durum güncellendi: Reddedildi', 'durum_degisikligi', '2026-05-11T12:10:20.385Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('193', '61', 'Başka yerle anlaşıldı', 'not', '2026-05-11T12:10:29.967Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('194', '60', 'hala değerlendirme aşamasında', 'not', '2026-05-11T12:10:48.313Z', 'Furkan', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('195', '64', 'Sisteme eklendi: "marketing alanında yerli ve yabancı firmalara danışmanlık veriyor sizlerle işbirliği yapmak isterim müsaitseniz önce ofisinize gelip tanışalım dedi çarşamba 11 uygun mu sizler için dedi"', 'not', '2026-05-11T12:11:31.774Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('196', '65', 'Sisteme eklendi: "Yeni bir oto bakım yeri açıyormuş ayda 1 -2 kez gelinsin video çekilsin istiyor sosyal medya hesabımız yönetilsin diyor hafta sonuna kadar açacağız dedi kendisine business paketimizi anlattım oradaki hizmet kalemlerini beğendi teklifi ileteceğim kendisine"', 'not', '2026-05-12T20:27:19.584Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('197', '66', 'Sisteme eklendi: "ürünlerin stüdyo ortamında farklı açılarda fotoğraf çekimi.
Ürünleri tanıtıcı ve kullanımlarını gösteren gerek iç mekanda gerek dış mekanda ürün videoları."', 'not', '2026-05-12T20:29:13.339Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('198', '66', 'Durum güncellendi: Teklif Bekliyor', 'durum_degisikligi', '2026-05-12T20:29:21.322Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('199', '67', 'Sisteme eklendi: "Teklif iletildi"', 'not', '2026-05-12T20:30:51.406Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('200', '67', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-12T20:30:55.743Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('201', '68', 'Sisteme eklendi: "Teklif iletildi"', 'not', '2026-05-12T20:31:12.126Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('202', '68', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-12T20:31:16.635Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('203', '69', 'Sisteme eklendi: "Teklif iletildi"', 'not', '2026-05-12T20:31:38.351Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('204', '70', 'Sisteme eklendi: "Teklif iletildi"', 'not', '2026-05-12T20:31:58.309Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('205', '70', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-12T20:32:02.917Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('206', '69', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-12T20:32:07.110Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('207', '71', 'Sisteme eklendi: "Teklif iletildi"', 'not', '2026-05-12T20:32:25.259Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "lead_history" ("id", "lead_id", "note", "type", "created_at", "author_name", "attachment_url", "file_name") VALUES ('208', '71', 'Durum güncellendi: Teklif İletildi', 'durum_degisikligi', '2026-05-12T20:32:28.414Z', NULL, NULL, NULL) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "leads" (
  "id" bigint PRIMARY KEY,
  "name" text NOT NULL,
  "date" text,
  "platform" text,
  "service" text,
  "rep" text,
  "reaction" text,
  "status" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "email" text,
  "phone" text,
  "campaign_id" uuid,
  "ad_id" uuid
);

INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('18', 'Emre Önder', '13 Nisan 2026', 'Instagram DM', 'Diğer (Bilinmiyor)', 'Simge', 'Sizleri hangi hizmetlerimiz ile ilgili bilgilendirelim?', 'Düşük Kalite', '2026-04-13T09:59:22.375Z', 'emre10der@instanick', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('23', 'Yunus Çınar | Plastic Surgeon', '13 Nisan 2026', 'Instagram DM (@https://www.instagram.com/dryunuscinar/)', '', '-', 'Fiyat teklifi iletildi değerlendirecekler', 'Reddedildi', '2026-04-13T10:16:27.562Z', '', '', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('19', 'Gülfem Gürsoy', '13 Nisan 2026', 'Instagram DM', 'Diğer (Bilinmiyor)', 'Simge', 'Sizleri hangi hizmetlerimiz ile ilgili bilgilendirelim?
', 'Düşük Kalite', '2026-04-13T10:00:43.341Z', 'gulfemgurs@instanick', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('25', 'erenhaneren', '17 Nisan 2026', 'Instagram DM (@erenhaneren)', 'Diğer (Sunuculu reklam videosu)', 'Simge', 'Telefon numarası bekleniyor', 'Düşük Kalite', '2026-04-17T09:19:16.923Z', '', '', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('20', 'Ali ipek', '13 Nisan 2026', 'Instagram DM (@aliipek80)', 'Diğer (Bilinmiyor)', 'Simge', 'Sizleri hangi hizmetlerimiz ile ilgili bilgilendirelim?
', 'Düşük Kalite', '2026-04-13T10:09:54.767Z', 'a@com', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('17', 'ibrahim', '13 Nisan 2026', 'Instagram DM', 'Diğer (Bilinmiyor)', 'Tuğba', 'Merhabalar tabii ki, sizlere hizmetlerimiz hakkında bilgilendirme yapmak isterim. Sunucu hizmeti mi almak istiyorsunuz?', 'Düşük Kalite', '2026-04-13T09:58:11.411Z', 'ibrahims0006@instanick', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('39', 'Enes Can Bayatlı', '27 Nisan 2026', 'Telefon', 'Diğer (Sunuculu Reklam Videosu)', 'Celal', 'Yazılım hizmeti yapan bir adam. 3 sunuculu video olarak anlaşıldı.', 'Sıcak', '2026-04-27T08:06:29.551Z', '', '', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('21', 'mustafa armağan', '13 Nisan 2026', 'Instagram DM (@cenn.et7360)', 'Diğer (Bilinmiyor)', 'Simge', 'Merhabalar, tabii ki. Sizleri hangi hizmetlerimiz ile ilgili bilgilendirelim?
', 'Düşük Kalite', '2026-04-13T10:12:05.337Z', '', '', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('31', 'Soldeenerji', '18 Nisan 2026', 'Instagram DM (@soldeenerji)', '', 'simge', 'fiyatı çok yüksek buldular', 'Düşük Kalite', '2026-04-18T08:43:25.091Z', '', '05072152250', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('42', 'safa turan', '30 Nisan 2026', 'Telefon', '360° Sosyal Medya Yönetimi, Video Prodüksiyon', 'Simge', 'Teklif iletildi', 'Teklif İletildi', '2026-04-30T11:54:00.188Z', '', '05325150450', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('24', 'İlmi Sina Doğal Sağlık Ürünleri', '17 Nisan 2026', 'Instagram DM (@ilmi.sina)', 'Diğer (Sunuculu Reklam Videosu)', 'Simge', 'Selim Bey sıvı mum üretimi yapıyor. İşletmesi Bahçelievler’de, Şirinevler Metro çıkışında. 4 farklı mum çeşidi için sunuculu profesyonel bir çekim yaptırmak istiyor.

Teklif hazırlarken ürünlerin bize gönderilip ofiste çekim yapılması ve çekimin kendi ofisinde yapılması olmak üzere iki farklı fiyat seçeneği sunabilir miyiz?', 'Reddedildi', '2026-04-17T09:18:07.137Z', '', '05323076526', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('34', 'ADS Design / Andaş Hasan Şahin ', '22 Nisan 2026', 'Instagram DM (@adsdesignn)', 'Diğer (Sunuculu reklam videosu)', 'Simge', 'geri dönüş yapamdı', 'Sıcak', '2026-04-22T12:34:38.045Z', '', '', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('5', 'Melissa Balo Davet', '08 Nisan 2026', 'Telefon', '360° Sosyal Medya Yönetimi, Meta & Google Reklam, Video Prodüksiyon, Web Tasarım / Yazılım', 'Tuğba', 'Diğer ajanslardan fiyat teklifi bekliyor', 'Reddedildi', '2026-04-08T08:35:06.259Z', NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('29', 'Volkan Alacalıoğlu', '18 Nisan 2026', 'Instagram DM (@volkan_alacalioglu)', '', 'simge', 'bir çok kez arandı uluşalımadı, tekrar aranacak', 'Beklemede', '2026-04-18T08:41:58.564Z', '', '05337251308', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('22', 'ARZU GÜLERYÜZ ALTINAY', '13 Nisan 2026', 'Instagram DM (@jyotiakademi )', '360° Sosyal Medya Yönetimi', 'Simge', 'Evet Arzu Hanım, hesap yönetimi hizmetimiz bulunuyor. İsterseniz sizleri arayıp detaylı bilgilendirme sağlayalım.
', 'Düşük Kalite', '2026-04-13T10:13:27.121Z', '', '', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('26', 'Katia / Keyana ', '17 Nisan 2026', 'Instagram DM (@katiaarslan)', '', 'Simge', 'Başka yerle anlaşmış
', 'Reddedildi', '2026-04-17T09:21:17.388Z', '', '', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('38', 'Işın Top', '25 Nisan 2026', 'Mail', 'Video Prodüksiyon', 'Simge', 'yanlış numara', 'Düşük Kalite', '2026-04-25T14:14:31.902Z', 'isimtop@hotmail.com', '5327358366', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('6', 'Evendify / Okan Serbest', '09 Nisan 2026', 'Instagram DM', '', 'Tuğba', 'Düşüneceğiz cevabı geldi', 'Düşük Kalite', '2026-04-09T19:41:20.606Z', 'a@a', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('32', 'Shahsanam Toprak', '21 Nisan 2026', 'Instagram DM (@shahsanam_sabirova1453)', 'Diğer (Sunuculu reklam tanıtım)', 'Simge', 'Telefon numarası bekleniyor', 'Düşük Kalite', '2026-04-21T10:33:13.404Z', '', '', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('16', 'Demir Saracoğlu ', '13 Nisan 2026', 'Instagram DM (@demirsaracoglu.pareyracom)', 'Diğer (Tüm hizmetlerinizin listesi var mı dedi)', 'Tuğba', 'aradım meşguldü tekrar arayacağım', 'Düşük Kalite', '2026-04-13T09:48:53.024Z', 'dm@demirsaracoglu.pareyracom', '05334419532', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('28', 'Merve ', '17 Nisan 2026', 'Instagram DM (@merveedrna)', '360° Sosyal Medya Yönetimi, Diğer (Sunuculu reklam videosu)', 'Simge', 'kendisi ile görüştüm. https://www.instagram.com/turkiyesothebysrealty?igsh=MTAzYmp3OG9uOW94 bu gayrimenkul şirketinin franchising''ini işletiyorlar. olmak istedikleri bir sayfa var şu şekilde https://www.instagram.com/thejetbusiness?igsh=aHlib2ZkOTg2Y3Uy bunun için sosyal medya hizmeti ve prodüksiyon hizmeti istiyorlar. kendilerini bilgilendirdim. ekibi ile görüşecek online bir görüşme için takvim oluşturacağız.

not: yerleri Sarıyer''de.', 'Düşük Kalite', '2026-04-17T09:23:13.187Z', '', '0546 212 37 56', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('33', 'Reklam 212 / Akın Bey', '22 Nisan 2026', 'Instagram DM (@reklam212)', '360° Sosyal Medya Yönetimi', 'Simge', 'tekrar aranacak', 'Reddedildi', '2026-04-22T12:33:15.362Z', '', '', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('40', 'Fatih Aslan / Design Floor', '27 Nisan 2026', 'Telefon', 'Video Prodüksiyon', 'Celal', 'tekrar haberleşilecek', 'Beklemede', '2026-04-27T10:13:03.341Z', '', '05333074412', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('70', 'Hilal esma bahadur', '12 Mayıs 2026', 'Arama', '', 'Celal', 'Teklif iletildi', 'Teklif İletildi', '2026-05-12T20:31:58.077Z', '', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('41', 'doğuhan taşar', '28 Nisan 2026', 'Telefon', 'Influencer Marketing, 360° Sosyal Medya Yönetimi, Diğer (Sunuculu reklam)', 'Simge', 'Teklif iletilecek', 'Teklif İletildi', '2026-04-28T14:29:33.058Z', '', '05448382323', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('27', 'Mustafa Kılıç ', '17 Nisan 2026', 'Instagram DM (@mstafakilic)', '360° Sosyal Medya Yönetimi', 'Simge', 'Stüdyosu daha açılmadı tekrar aranacak', 'Reddedildi', '2026-04-17T09:22:30.012Z', '', '05383256512', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('30', 'Gökhan Güven', '18 Nisan 2026', 'Instagram DM (@1gokhanguven)', '', 'simge', 'bir çok kez arandı ve ulaşılamadı', 'Reddedildi', '2026-04-18T08:42:33.957Z', '', '05412498425', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('35', 'Mustafa Bayrak / Dubai ', '23 Nisan 2026', 'Telefon', 'Diğer (Sunuculu Reklam Videosu), 360° Sosyal Medya Yönetimi', 'Simge', 'çalışamaya başlayalım, lead sonrası para veririm dedi', 'Reddedildi', '2026-04-23T15:46:00.762Z', '', '', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('71', 'Octopus software', '12 Mayıs 2026', 'Arama', '', 'Celal', 'Teklif iletildi', 'Teklif İletildi', '2026-05-12T20:32:25.085Z', '', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('54', 'Georgia / İbrahim Albayrak', '04 Mayıs 2026', 'Telefon', '360° Sosyal Medya Yönetimi', 'Celal', 'Daha inceleyememiş', 'Teklif İletildi', '2026-05-04T09:44:24.871Z', '', '', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('50', 'Habip Özkan', '04 Mayıs 2026', 'Instagram DM (@habipozkann)', 'Diğer (Sunuculu Reklam Videosu)', 'Simge', '7.30 da arayabilirsiniz
dedi', 'Beklemede', '2026-05-04T08:14:59.501Z', '', '0531 589 3987', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('44', 'ŞAHIN', '02 Mayıs 2026', 'Mail', 'Diğer (Bilinmiyor)', 'Simgex', 'siteden form doldurdu', 'Beklemede', '2026-05-02T12:17:01.610Z', 'ozdemirsahin416@gmail.com', '05055378101', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('45', 'Okshan Oktay', '02 Mayıs 2026', 'Mail', 'Video Prodüksiyon', 'Simge', 'Merhaba, DJ tanıtım/trailer videosu yaptırmak istiyorum. 🎧 Video konsepti: DJ OKSHAN için cinematic / hype trailer Süre: 20–40 saniye Stil: karanlık, neon ışıklı, enerjik 🔥 Video akışı (çok önemli): Giriş (0–5 sn) Siyah ekran + “DJ OKSHAN” yazısı Yavaş zoom + glitch / flash efekti Build-up (5–20 sn) DJ konsolu, kulaklık, miks anları Hızlı kesitler (beat ile uyumlu) Işık efektleri (laser / strobe / club vibe) Drop (20–30 sn) En enerjik sahneler Kalabalık / eğlence hissi (varsa stock görüntü de olabilir) Yazı: “Music • Energy • Vibe” Final (son 5 sn) Büyük logo: DJ OKSHAN 🎧🪩 Alt yazı: “Book Now / Rezervasyon” 🎵 Müzik: EDM / Tech House / Festival style Drop’lu, enerjik bir parça 🎨 Stil: Siyah arka plan + neon mavi/kırmızı ışıklar Hızlı geçişler Sinematik / modern DJ promo hissi 📱 Kullanım: Instagram Reels TikTok WhatsApp status


Hangi hizmetlere ihtiyacın var?

Ses / müzik düzenlemeleri
Animasyon / görsel efekt
Montaj / kurgu / editing
Alt yazı
Seslendirme
Video & fotoğraf çekimi

Ne tür bir video düzenlenecek ?

Tanıtım videosu

Video uzunluğu ne kadar ?

1 dakika veya daha az
', 'Beklemede', '2026-05-02T12:18:06.732Z', ' okshan.oktay@gmail.com', '', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('46', 'Recep Tanrıkulu ', '04 Mayıs 2026', 'Telefon', 'Diğer', 'Simge', 'Fiyat çok yüksek geldi', 'Reddedildi', '2026-05-04T08:05:31.540Z', '', '05345902084', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('49', 'Müberra Çavdar', '04 Mayıs 2026', 'Instagram DM (@cavdarmy)', '360° Sosyal Medya Yönetimi', 'Simge', 'Bilgi verildi ama görüldü attı tekrar iletişim kurulabilir', 'Beklemede', '2026-05-04T08:13:03.566Z', '', '', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('61', 'Tansu güler', '07 Mayıs 2026', 'Arama', '360° Sosyal Medya Yönetimi', 'Simge', 'Başka yerle anlaşıldı', 'Reddedildi', '2026-05-07T08:07:26.549Z', '', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('51', 'Cem Yıldırım', '04 Mayıs 2026', 'Instagram DM (@cem_yldrm25)', 'Diğer (Sunuculu Reklam Videosu)', 'Simge', '04.05.2026 tarihinde aranacak', 'Beklemede', '2026-05-04T08:16:48.804Z', '', '0535 670 17 13', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('57', 'Dilara / Makyaj', '04 Mayıs 2026', 'Telefon', 'Diğer (Stüdyoda çekim), 360° Sosyal Medya Yönetimi', 'Celal', 'Modellere saç makyaj yapıp çekim yaptırmak istiyor. ', 'Beklemede', '2026-05-04T15:56:58.170Z', '', '', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('62', 'Volkan Bey / O''ves Skincare', '07 Mayıs 2026', 'Arama', 'Sunuculu Reklam Videosu', 'Simge', 'Kendi cilt bakım markası ürün premium sayfa akışım içeriklerim çok premium olsun istiyorum bu konuda hassasım diyor. Yeri bakırköyde. Kaliteli Ugcler ile içerik çalışmak istiyorum dedi. Burada  sunuculu videolarımızı kullanıcı videolarına çevirebilir miyiz? Örneğin cilt bakımı yaptığı, ürünü cildime uyguladığı bir video? Businness paket uygun geldi ancak kendisine iyi bir strateji hazırlanmalı özellikle prodüksiyon tarafında önerilere açık sizin yapabileceklerinizi de dinlemek istiyorum dedi
Aylık 30k reklam bütçesi var', 'Teklif Bekliyor', '2026-05-07T08:10:03.154Z', '', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('55', 'Necla / Eğitim Sektörü', '04 Mayıs 2026', 'Telefon', '360° Sosyal Medya Yönetimi', 'Celal', 'Kısa danışmanlık verildi. Müdürü ile görüşüp haber verecek. ', 'Beklemede', '2026-05-04T09:46:05.855Z', '', '0506 694 3804', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('47', 'Ayşegül Solmaz / Cookaba', '04 Mayıs 2026', 'Instagram DM (@aysegulnil99)', 'Diğer (Sunuculu Reklam Videosu)', 'Simge', 'Levent’te beyaz yakaların sürekli geldiği bir yer alkol ruhsatını henüz almamışlar. Profesyonel olsun ama resmi olmasın daha sıcak samimi içeriklerin yer aldığı bir sosyal medya ve reklam yönetimi ile bilinirliğinin arttığı bir hizmet istiyor. Burada nasıl bir paket önerelim businness uygun mudur? Teklif bekliyor kendisi', 'Beklemede', '2026-05-04T08:06:52.673Z', '', '0532 703 8080', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('53', 'Ramazan Subaşı', '04 Mayıs 2026', 'Instagram DM (@subasiramazan)', 'Diğer (Sunuculu Reklam Videosu)', 'Simge', 'Toplantı için tarih verecekti dönüş yapmadı', 'Teklif Bekliyor', '2026-05-04T08:19:11.531Z', '', '0554 364 54 27', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('56', 'Yasin Uysan / sendekomimarlik', '04 Mayıs 2026', 'Instagram DM (@sendekomimarlik)', '360° Sosyal Medya Yönetimi, Diğer (Sunuculu Reklam Videosu)', 'Simge', 'simge hanım arayıp ulaşamamış', 'Teklif İletildi', '2026-05-04T14:15:17.948Z', '', '05343859096', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('65', 'Selim Bey', '12 Mayıs 2026', 'Arama', '360° Sosyal Medya Yönetimi', 'Simge', 'Yeni bir oto bakım yeri açıyormuş ayda 1 -2 kez gelinsin video çekilsin istiyor sosyal medya hesabımız yönetilsin diyor hafta sonuna kadar açacağız dedi kendisine business paketimizi anlattım oradaki hizmet kalemlerini beğendi teklifi ileteceğim kendisine', 'Beklemede', '2026-05-12T20:27:19.366Z', '', '0532 292 5150', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('48', 'almila kumbaraci / mystudiotr', '04 Mayıs 2026', 'Instagram DM (@almilakumbaraci)', '360° Sosyal Medya Yönetimi, Sosyal Medya Yönetimi', 'Simge', 'Ulaşılamıyor...', 'Reddedildi', '2026-05-04T08:11:43.033Z', '', '05323143626 ', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('58', 'Tunç Bilgen', '05 Mayıs 2026', 'Instagram DM (@tuncbilgen)', 'Sunuculu Reklam Videosu', 'Simge', 'Telefon numarası iletti', 'Beklemede', '2026-05-05T08:02:36.501Z', '', '0532 406 82 78', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('43', 'Emel hanım / Kozz Atelier', '30 Nisan 2026', 'Telefon', '360° Sosyal Medya Yönetimi', 'Simge', 'Başka firma ile anlaştı', 'Reddedildi', '2026-04-30T11:54:32.257Z', '', '05535500193', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('59', 'Selim İlkılıç ', '05 Mayıs 2026', 'Instagram DM (@selimilk)', 'Sunuculu Reklam Videosu', 'Simge', 'aradım açmadı
', 'Beklemede', '2026-05-05T08:03:41.311Z', '', '0532 292 51 50', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('60', 'Hande Gürsoy', '07 Mayıs 2026', 'Arama', 'Video Prodüksiyon', 'Simge', 'hala değerlendirme aşamasında', 'Teklif İletildi', '2026-05-07T08:06:31.056Z', '', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('52', 'Okan Hocaoğlu / Japon Konutları', '04 Mayıs 2026', 'Instagram DM (@okanhocaoglu)', 'Diğer (Sunuculu Reklam Videosu)', 'Simge', 'Ofise geldi konuştuk teklif bekliyor', 'Teklif İletildi', '2026-05-04T08:18:03.052Z', '', '5325218849', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('63', 'Metin / Sarıhan İşkembe ', '11 Mayıs 2026', 'Arama', '360° Sosyal Medya Yönetimi', 'Celal', 'Fiyat listesi atıldı. ', 'Beklemede', '2026-05-11T09:12:14.979Z', '', '0535 573 7565', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('64', 'Fahri Gökya', '11 Mayıs 2026', 'Arama', 'Diğer (Bilinmiyor)', 'Simge', 'marketing alanında yerli ve yabancı firmalara danışmanlık veriyor sizlerle işbirliği yapmak isterim müsaitseniz önce ofisinize gelip tanışalım dedi çarşamba 11 uygun mu sizler için dedi', 'Beklemede', '2026-05-11T12:11:31.545Z', '', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('66', 'Class Teknoloji', '12 Mayıs 2026', 'Arama', '', 'Celal', 'ürünlerin stüdyo ortamında farklı açılarda fotoğraf çekimi.
Ürünleri tanıtıcı ve kullanımlarını gösteren gerek iç mekanda gerek dış mekanda ürün videoları.', 'Teklif Bekliyor', '2026-05-12T20:29:13.131Z', '', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('67', 'İnci bulut', '12 Mayıs 2026', 'Arama', '', 'Simge', 'Teklif iletildi', 'Teklif İletildi', '2026-05-12T20:30:51.174Z', '', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('68', 'Adbusters agency', '12 Mayıs 2026', 'Arama', '', 'Simge', 'Teklif iletildi', 'Teklif İletildi', '2026-05-12T20:31:11.820Z', '', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('69', 'Düğün app', '12 Mayıs 2026', 'Arama', '', 'Celal', 'Teklif iletildi', 'Teklif İletildi', '2026-05-12T20:31:38.180Z', '', '-', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "leads" ("id", "name", "date", "platform", "service", "rep", "reaction", "status", "created_at", "email", "phone", "campaign_id", "ad_id") VALUES ('72', 'Furkan', '13 Mayıs 2026', 'ebe', 'Fotoğraf çekimi', 'Sistem (Hizmet Sayfası)', 'Hizmet sayfasından form dolduruldu. Randevu: 2026-05-14 17:00 - 18:00', 'Beklemede', '2026-05-13T09:17:16.315Z', 'sdasda@gmal.com', '5370428647', NULL, NULL) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "meetings" (
  "id" bigint PRIMARY KEY,
  "client_id" bigint,
  "meeting_date" timestamp with time zone DEFAULT now(),
  "participant" text,
  "note" text,
  "next_step" text,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "projects" (
  "id" bigint PRIMARY KEY,
  "client_id" bigint,
  "title" text NOT NULL,
  "status" text,
  "deadline" date,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "staff" (
  "id" bigint PRIMARY KEY,
  "username" text NOT NULL,
  "display_name" text NOT NULL,
  "role" text,
  "class" text,
  "can_assign_task" boolean DEFAULT false,
  "can_add_client" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

INSERT INTO "staff" ("id", "username", "display_name", "role", "class", "can_assign_task", "can_add_client", "created_at") VALUES ('1', 'tugba', 'Tuğba', 'Sosyal Medya Uzmanı', 'Çalışan', false, true, '2026-04-07T17:09:09.329Z') ON CONFLICT DO NOTHING;
INSERT INTO "staff" ("id", "username", "display_name", "role", "class", "can_assign_task", "can_add_client", "created_at") VALUES ('2', 'celal', 'Celal', 'Kurucu', 'Görevli', true, true, '2026-04-07T17:09:09.329Z') ON CONFLICT DO NOTHING;
INSERT INTO "staff" ("id", "username", "display_name", "role", "class", "can_assign_task", "can_add_client", "created_at") VALUES ('3', 'ercan', 'Ercan', 'Kurucu', 'Görevli', true, true, '2026-04-07T17:09:09.329Z') ON CONFLICT DO NOTHING;
INSERT INTO "staff" ("id", "username", "display_name", "role", "class", "can_assign_task", "can_add_client", "created_at") VALUES ('4', 'betul', 'Betül', 'ART Direktör', 'Çalışan', false, true, '2026-04-07T17:09:09.329Z') ON CONFLICT DO NOTHING;
INSERT INTO "staff" ("id", "username", "display_name", "role", "class", "can_assign_task", "can_add_client", "created_at") VALUES ('5', 'simge', 'Simge', 'Sosyal Medya Specialist', 'Görevli', true, true, '2026-04-07T17:09:09.329Z') ON CONFLICT DO NOTHING;
INSERT INTO "staff" ("id", "username", "display_name", "role", "class", "can_assign_task", "can_add_client", "created_at") VALUES ('6', 'furkan', 'Furkan', 'Dijital Pazarlama Uzmanı', 'Görevli', true, true, '2026-04-07T17:09:09.329Z') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "staff_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone DEFAULT now(),
  "staff_name" text NOT NULL,
  "staff_role" text,
  "content" text,
  "file_url" text,
  "file_name" text,
  "external_link" text,
  "report_date" date DEFAULT CURRENT_DATE,
  "external_links" jsonb
);

INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('ae3bf5c7-96f3-459a-858a-63826e0c6f54', '2026-04-15T14:38:54.408Z', 'Furkan', 'Dijital Pazarlama Uzmanı', 'ADS''de reklam şablonu oluşturuldu - düzenlendi
Sitede UX ve işlev düzenlemeleri yapıldı
Raporlar sayfası eklendi
Mobil uygulama için deneme çalışmaları gerçekleşti.', NULL, NULL, '', '2026-04-14T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('96f91c4a-6a0b-4288-8607-61bb8e876cb3', '2026-04-16T15:34:31.731Z', 'Simge', 'Sosyal Medya Specialist', 'Arayan Var markası için 3’lü grid yapısına uygun bir içerik briefi hazırladım ve görsel dilin Instagram’da güçlü bir ilk izlenim yaratacak şekilde kurgulanmasına odaklandım.
Instagram hesabı üzerinde gelen mesajları detaylı şekilde kontrol ettim; özellikle daha önce iletişim kurulmuş ancak dönüş alınamamış soğuk datalara yeniden ulaşarak iletişimi canlandırmaya çalıştım. Bu süreçte, potansiyel kullanıcılarla tekrar temas kurup telefon numarası alma ve süreci daha sıcak bir diyaloğa dönüştürme üzerine aksiyon aldım.
Facebook tarafında ise Arayan Var hesabının kapalı olduğunu tespit ettim. Bu konuyla ilgili olarak Erdi Bey’in yönlendirmesiyle Zeynep Hanım ile iletişime geçerek süreci birlikte ilerlettim. Hesabın yeniden aktif hale getirilmesi adına yeni bir Gmail hesabı oluşturdum ve buna bağlı olarak yeni bir Facebook hesabı kurulumu gerçekleştirdim.
Bununla birlikte, markanın içerik tarafını güçlendirmek adına sektörel ve rakipsel içerik araştırmaları yaptım. Arayan Var için nasıl daha dikkat çekici, etkileşim odaklı ve sürdürülebilir bir içerik dili oluşturabileceğimizi analiz ettim. Bu doğrultuda farklı içerik fikirleri geliştirdim ve markanın iletişim diline uygun içerikler hazırladım.', NULL, NULL, NULL, '2026-04-15T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('76aa5240-020e-415a-aaf8-b3193f3fc984', '2026-04-16T22:48:14.721Z', 'Furkan', 'staff', 'dıdıdıddıdıdıddıdıdıddı', 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/lead-attachments/reports/Furkan_1776379693258.png', 'Yeni (Instagram Hikayesi) (2).png', NULL, '2026-04-15T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('9b39613d-6c17-46dd-b246-bd05b86ea1aa', '2026-04-17T19:10:27.611Z', 'Tuğba', 'Sosyal Medya Uzmanı', 'Gurme Bahçeşehir: Story paylaşıldı ve gönderi (post) atıldı.
• Gurme Mall of: Story paylaşıldı ve gönderi (post) atıldı.
• Karadeniz Et Lokantası: Story paylaşıldı ve gönderi (post) atıldı.
• Döner Evim: Story paylaşıldı ve gönderi (post) paylaşıldı.
• Socketta: Story paylaşıldı ve gönderi (post) atıldı.
• Social Art Ajans: Story paylaşıldı.
• E-posta Yönetimi: E-postalar gönderildi.', NULL, NULL, NULL, '2026-04-16T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('9dc2c078-1451-4e3d-877f-0288df449040', '2026-04-20T20:16:56.171Z', 'Tuğba', 'Sosyal Medya Uzmanı', '• Gurme Bahçeşehir: Story paylaşıldı.
• Gurme Mall of: Story paylaşıldı.
• Karadeniz Et Lokantası: Story paylaşıldı.
• Döner Evim: Story paylaşıldı.
• Socketta: Story paylaşıldı ve yapay zeka görselleri oluşturuldu.
• Social Art Ajans: Story paylaşıldı.
• Yarın İçin Hazırlık: Tüm markaların yarınki içerikleri planlandı.
• E-posta Yönetimi: Tüm e-postalar gönderildi ve cevaplandı.', NULL, NULL, NULL, '2026-04-19T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('585949ee-533d-4ef0-872b-56d750ef08a6', '2026-04-21T20:17:26.233Z', 'Tuğba', 'Sosyal Medya Uzmanı', '• Gurme Bahçeşehir: Story ve gönderi paylaşımları yapıldı.
• Gurme Mall of: Story ve gönderi paylaşımları yapıldı.
• Karadeniz Et Lokantası: Gönderi ve story paylaşımları tamamlandı.
• Socketta: Story içerikleri üretildi ve paylaşıldı.
• Social Art Ajans: Story paylaşımları gerçekleştirildi.
.Döner Evim : story paylaşımı yapıldı
• Yarın İçin Hazırlık: Gelecek günün içerik planlamaları ve hazırlıkları tamamlandı.', NULL, NULL, NULL, '2026-04-20T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('75983582-9071-4514-9700-a0840f913113', '2026-04-22T20:12:38.535Z', 'Tuğba', 'Sosyal Medya Uzmanı', '• Gurme Bahçeşehir: Story paylaşıldı.
• Gurme Mall of: Story paylaşıldı.
• Karadeniz Et Lokantası: Story paylaşıldı.
• Döner Evim: Story paylaşıldı.
• Socketta: Story paylaşıldı ve yapay zeka görselleri oluşturuldu.
• Social Art Ajans: Story paylaşıldı.
23 Nisan afişleri üretildi ve iletildi.', NULL, NULL, NULL, '2026-04-21T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('d9b72a48-b03d-4e2c-bcaf-b4684848c4cb', '2026-05-02T18:33:37.217Z', 'Tuğba', 'Sosyal Medya Uzmanı', 'Gurme Bahçeşehir: İçerik takvimi hazırlandı ve story paylaşımları yapıldı.

Gurme Mall of: İçerik takvimi hazırlandı ve story paylaşımları yapıldı.

Karadeniz Et Lokantası: İçerik takvimi hazırlandı ve story paylaşımları yapıldı.

Socketta: İçerikler ghost ve infografik formatlarına dönüştürülerek ilgili dosyalara eklendi.

E-Posta Yönetimi: Mevcut e-postalar iletildi ve yeni e-posta lead toplama süreci başlatıldı.

Yarın İçin Hazırlık: 03 Mayıs tarihli tüm paylaşımlar hazırlandı.', NULL, NULL, NULL, '2026-05-01T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('24d7f17f-43f7-4cb0-9618-0488952a80d3', '2026-05-02T18:34:37.473Z', 'Tuğba', 'Sosyal Medya Uzmanı', 'Socialart Ajans aylık içerikleri Canva da yaşanan hata nedeni ile düzenlenemedi', NULL, NULL, NULL, '2026-05-01T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('04ad76ac-4953-4fe5-bd44-f10da704024c', '2026-05-04T18:25:02.467Z', 'Furkan', 'Dijital Pazarlama Uzmanı', 'Deneme
deneme 2', NULL, NULL, NULL, '2026-05-03T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('87593317-66ab-4658-b11a-2b3ae4084c05', '2026-05-06T18:59:50.641Z', 'Tuğba', 'Sosyal Medya Uzmanı', 'İçerik Yönetimi: Tüm markaların (Gurme Bahçeşehir, Gurme Mall of, Karadeniz Et Lokantası) etkileşim odaklı içerik süreçleri yönetildi; bu süreçte raporlamalarda kullanılacak tüm veriler ve güncel istatistikler ilgili taraflara iletildi.

Gurme Bahçeşehir ve diğer markalar için yarın paylaşılacak olan gönderilerin planlaması tamamlandı.

Odor Time sunumu hazırlandı.

Socketta: Ghost ve infografik çalışmalarının güncellenmesi ve dosya düzenlemeleri yapıldı.', NULL, NULL, NULL, '2026-05-05T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('f1813e23-dc61-45f8-808b-7ec1c2505f75', '2026-05-09T09:18:46.715Z', 'Furkan', 'Dijital Pazarlama Uzmanı', 'DENEME', NULL, NULL, NULL, '2026-05-08T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('e0ec8207-ad6b-482b-96ac-1e5d62edd692', '2026-05-09T09:19:18.082Z', 'Tuğba', 'Sosyal Medya Uzmanı', 'Gün içinde ', NULL, NULL, NULL, '2026-05-08T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('c85d6e44-0703-4952-962f-cfcbcd4074a3', '2026-05-12T20:26:20.922Z', 'Furkan', 'Dijital Pazarlama Uzmanı', 'Socketta flat çalışması
E-posta marketing için şirket araştırması
Yeni google ads panel başvurusu
Web çalışması', NULL, NULL, NULL, '2026-05-11T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;
INSERT INTO "staff_reports" ("id", "created_at", "staff_name", "staff_role", "content", "file_url", "file_name", "external_link", "report_date", "external_links") VALUES ('46a8070e-fb1c-4e70-8873-a849c6107e53', '2026-05-12T21:46:14.958Z', 'Tuğba', 'Sosyal Medya Uzmanı', '• Gurme Bahçeşehir: Günlük etkileşim yönetimi yapıldı ve yarın paylaşılacak olan yeni gönderilerin planlaması tamamlandı.
• Gurme Mall of: Markanın günlük paylaşım akışı ve story süreçleri kesintisiz olarak yönetildi.
• Karadeniz Et Lokantası: Günlük etkileşim takibi yapıldı ve planlanan gönderi paylaşımı başarıyla gerçekleştirildi.
• Miocasa: Marka özelinde hazırlanan video içeriği yayına alındı.
• Socketta: Ghost içeriklerin ve infografik çalışmalarının dosya düzenleme süreçlerine aktif olarak devam edildi.', NULL, NULL, NULL, '2026-05-11T21:00:00.000Z', '[]') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "tasks" (
  "id" bigint PRIMARY KEY,
  "assignee_name" text NOT NULL,
  "task_text" text NOT NULL,
  "status" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "client_name" text,
  "phase" integer DEFAULT 1,
  "category" text,
  "priority" text,
  "due_date" text,
  "assigned_by" text,
  "brief_request" text,
  "extension_request" text,
  "rating" integer,
  "rating_comment" text,
  "rating_by" text,
  "brief_response" text,
  "extension_response" text,
  "fail_reason" text,
  "client_id" bigint,
  "attachment_url" text,
  "attachment_name" text
);

INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('21', 'Simge', '15.04.2026 çekimi için döner evime içerik stratejisi hazırlanacak.', 'Yaptım', '2026-04-15T10:27:30.330Z', NULL, 1, 'Proje', '#2979ff', NULL, 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('40', 'Simge', 'socketta sporcu tema ugc liste hazırlanacak.', 'Tamamlanamadı', '2026-04-18T08:28:38.155Z', NULL, 1, 'Proje', '#2979ff', '2026-04-22', 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('22', 'Tuğba', 'Döner Evim

1) Mayıs ayı için seçilen videolardaki yazı düzenlemelerini tamamlanacak

 2) Reels kurgularını finalize et ve yayına hazır hale getirilecek.

 3) WhatsApp konum kaydı sürecini takip edilecek ve onay durumunu kontrol edilecek.', 'Yaptım', '2026-04-15T11:35:46.737Z', NULL, 1, 'Proje', '#2979ff', NULL, 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('25', 'Tuğba', 'Gurme Bahçeşehir

1) Yeni çekimler arasından Reels içerik seçimleri tamamlanacak

2) Özge Hanım’dan gelen revizeler uygulanarak içerikler güncellenecek
 
3) Güncellenen içerikler paylaşım planına dahil edilecek', 'Yaptım', '2026-04-15T11:38:40.076Z', NULL, 1, 'Proje', '#2979ff', NULL, 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('24', 'Tuğba', 'İçerik Planlama & Paylaşım

 1) Tüm markalar için story paylaşımları düzenli olarak sürdürülecek

 2) Planlanan gönderilerin yayın takibi yapılacak

3) Karadeniz Et Lokantası gönderisinin performansı analiz edilecek', 'Yaptım', '2026-04-15T11:37:56.231Z', NULL, 1, 'Proje', '#2979ff', NULL, 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('23', 'Tuğba', 'PhantomBuster & Lead Generation

 1) Toplanan 200+ e-posta verisini kontrol edilecek (doğruluk & tekrar edenler)

2)  Excel datası segmentlere ayrılacak (plaza / şirket / sektör vb.)

3) Lead’ler için iletişim veya kampanya planı oluşturulacak.', 'Yaptım', '2026-04-15T11:36:50.710Z', NULL, 1, 'Proje', '#2979ff', NULL, 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('28', 'Ercan', 'sunucu videosunu google ads''de çıkmak istiyoruz o sebeple videonun aşağıda verilen ölçülerine uygun boyutlarını rica edeceğim.


1920 x 1080
1080 x 1920
1080 x 1080', 'Yaptım', '2026-04-15T11:55:08.214Z', NULL, 1, 'Proje', '#ff1744', NULL, 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('29', 'Celal', 'çekim takviminizi bizlerle paylaşmanızı rica edeceğiz. gitmeden markaya strateji sunumlarını önceden hazırlamış oluruz.', 'Yaptım', '2026-04-16T08:03:15.424Z', NULL, 1, 'Proje', '#2979ff', NULL, 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('44', 'Ercan', 'https://trello.com/c/lhf0unYf/184-odortime-4-post-i%CC%87%C3%A7eri%C4%9Fi 

post içeriklerini buradan bulabilirsin. görsel kimlik hazırlamanı rica ediyorum.', 'Tamamlanamadı', '2026-04-30T11:35:20.519Z', NULL, 1, 'Proje', '#2979ff', '2026-05-02', 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('45', 'Celal', 'Post:

"Lobimizde bir şey eksik, ama ne olduğunu bilmiyorum."

Bize bunu söylediklerinde, 47 odalı butik bir oteldeydik.
Resepsiyonu güzeldi. Işıklandırma mükemmeldi.
Ama misafirler içeri girince duraksayıp "ah işte bu" demiyordu.

Biz o unutulmaz ilk anı yarattık.

Oteldekiler 3 hafta sonra misafir yorumlarına baktıklarında yorumlar şu şekildeydi:
"Burası çok huzurlu."
"Neden bu kadar rahat hissettirdiğini anlayamıyorum."
"Kesinlikle yine geleceğim."

Hiçbiri kokudan bahsetmemişti.
Ama hepsi aynı hissi yaşamıştı.

İşte koku pazarlaması böyle çalışır. Fark edilmez, sadece hissedilir.

Sizin mekânınız da bu hikayeyi yaşayabilir.

Ücretsiz danışmanlık için link bio''da.

#odortimekurumsal #kokumimarı #referans #oteldeneyimi #scentmarketing #müşteribaşarısı #kurumsal koku #hospitality #mekanaruh #ambientscenting

Post:

Bir lobi sadece bir giriş değildir.

İlk izlenim burada başlar.
Misafiriniz kararı  (oturacak mı, kalacak mı, geri dönecek mi) kapıdan girerken zaten verir.

Ve bu kararın %65''i gördüklerine değil,
hissettiklerine dayanır.

Koku, beynin duygusal merkeziyle direkt konuşan tek duyudur.
Biz bu konuşmayı tasarlıyoruz.

Mekânınız için ücretsiz koku danışmanlığı için link bio''da.

#odortimekurumsal #kokumimarı #oteldeneyimi #scentmarketing #kurumsal koku #mekanaruh #hospitality #otelpazarlama #ambientscenting #scentbranding

Post:

Kurumsal kokulandırma bir lüks değil;
markanın en sessiz ama en kalıcı iletişimidir.

Konuşmaz ama hissettirir.
Görünmez ama hatırlatır.
Mekândan çıkıldığında bile etkisi devam eder.

Dünyanın en iyi otelleri bunu biliyor.
En güçlü perakende markaları bunu kullanıyor.
En çok tercih edilen klinikler, hastaların hissettiği ortamı bilinçli olarak tasarlıyor.

Türkiye’de ise bu dönüşüm yeni başlıyor.

Biz, markaların sadece görülmesini değil,
hatırlanmasını sağlıyoruz.

Mekânınızın nasıl hatırlanacağını birlikte belirleyelim. Link Bio’da.

#odortimekurumsal #kokumimarı #scentmarketing #markapazarlama #kurumsalkoku #B2Bpazarlama #otelmarketing #scentbranding

Post:

Evinizin kokusu, misafirlerinizin sizde bıraktığı hissin en güçlü parçası.

Daha kapıdan girer girmez bir sıcaklık,
bir özen,
bir “iyi ki gelmişim” duygusu

Kimse uzun uzun anlatmaz.
Ama herkes hisseder.

Ve bazı evlere insanlar sadece gelmez,
geri de döner.

Sırrınız biziz.

#odortimekurumsal #evkokusu #difüzör #esans #misafirağırlama #evdeiyilik #kokulandırma #huzur #evhissi #kokuterapi', 'Sırada', '2026-05-04T11:49:22.269Z', NULL, 1, 'Proje', '#2979ff', NULL, 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('32', 'Simge', 'Arayan Var 3lü Grid için Breif hazırlanacak.', 'Yaptım', '2026-04-16T11:39:49.344Z', NULL, 1, 'Proje', '#2979ff', NULL, 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('33', 'Simge', 'Arayan Var Meta Hesabı kurulacak.', 'Sırada', '2026-04-16T11:42:47.190Z', NULL, 1, 'Proje', '#2979ff', NULL, 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('26', 'Furkan', 'metada sunuculu reklam kreatifleri çıkılacak.', 'Yaptım', '2026-04-15T11:48:13.555Z', NULL, 1, 'Proje', '#2979ff', 'null', 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('27', 'Furkan', 'google ads performans marketing reklamı çıkılacak. Bununla ilgili kreatif briefini betüle vereceğim sen reklamı kurabilirsin.', 'Yapıyorum', '2026-04-15T11:50:12.700Z', NULL, 1, 'Proje', '#2979ff', NULL, 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BRİEF TALEBİ', NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('31', 'Ercan', 'Arayan Var  3''lü Grid Brief whatsapptan ilettim.', 'Yaptım', '2026-04-16T11:39:19.040Z', NULL, 1, 'Proje', '#2979ff', NULL, 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('30', 'Ercan', 'Sahne marin drone çekimi yapılacak', 'Yaptım', '2026-04-16T11:25:51.205Z', NULL, 2, 'Video', '#ff1744', '2026-04-16', 'Celal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('34', 'Ercan', 'Socketta icon', 'Yaptım', '2026-04-16T16:43:30.844Z', NULL, 1, 'Proje', '#2979ff', NULL, 'Ercan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('43', 'Furkan', 'Socketta''nın ghost çekim fotoğrafları yatay çifte dönüştürülecek', 'Yaptım', '2026-04-20T08:06:54.390Z', 'Socketta', 3, 'Fotoğraf', '#2979ff', '2026-04-20', 'Furkan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('41', 'Betül', 'arayan var için 5 grafik hazırlanacak. Breifleri whatsapp üzerinden ilettim.', 'Tamamlanamadı', '2026-04-18T08:32:13.370Z', NULL, 1, 'Proje', '#2979ff', '2026-04-20', 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('42', 'Simge', 'Arayanvar sunum hazırlanacak', 'Tamamlanamadı', '2026-04-18T17:12:16.008Z', NULL, 1, 'Proje', '#2979ff', '2026-04-20', 'Ercan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "tasks" ("id", "assignee_name", "task_text", "status", "created_at", "client_name", "phase", "category", "priority", "due_date", "assigned_by", "brief_request", "extension_request", "rating", "rating_comment", "rating_by", "brief_response", "extension_response", "fail_reason", "client_id", "attachment_url", "attachment_name") VALUES ('20', 'Simge', 'arayan var markası için 

1) strateji sunumu hazırlandı.
2) influencer listesi hazırlandı, bütçe alınıp tabloya girildii.
3) ugc listesi hazırlandı.
4) cast sunumu hazırlandı.

ercana teslim edildi.
', 'Yaptım', '2026-04-15T10:24:50.390Z', NULL, 1, 'Proje', '#2979ff', NULL, 'Simge', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "ugc_applications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone DEFAULT now(),
  "full_name" text NOT NULL,
  "phone" text NOT NULL,
  "email" text NOT NULL,
  "instagram_url" text,
  "portfolio_url" text,
  "city" text,
  "about" text,
  "status" text
);

INSERT INTO "ugc_applications" ("id", "created_at", "full_name", "phone", "email", "instagram_url", "portfolio_url", "city", "about", "status") VALUES ('b2e1da96-70f9-4128-811a-cc06d9a1717d', '2026-05-11T09:01:38.989Z', 'Test UGC', '05551234567', 'testugc@example.com', '@testugc', 'https://test.com', 'Istanbul', 'This is a test UGC application.', 'Bekliyor') ON CONFLICT DO NOTHING;
INSERT INTO "ugc_applications" ("id", "created_at", "full_name", "phone", "email", "instagram_url", "portfolio_url", "city", "about", "status") VALUES ('1aeb453b-db6e-4bbd-b424-d0f4f2f5d9cf', '2026-05-11T09:50:30.034Z', 'deneme', '05370428647', 'de@de', 'de', 'https://drive.google.com/drive/my-drive', 'de', 'de', 'Bekliyor') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "v2_client_appointments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id" uuid,
  "tarih" date NOT NULL,
  "saat" time without time zone NOT NULL,
  "gorusme_tipi" text,
  "notlar" text,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "v2_clients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "firma_adi" text,
  "yetkili_kisi" text,
  "durum" text,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "v2_daily_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "staff_id" uuid,
  "notlar" text,
  "linkler" jsonb,
  "tarih" date DEFAULT CURRENT_DATE,
  "created_at" timestamp with time zone DEFAULT now(),
  "harcanan_saat" numeric
);


CREATE TABLE IF NOT EXISTS "v2_lead_interactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "lead_id" uuid,
  "staff_id" uuid,
  "notlar" text,
  "iletisim_yolu" text,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "v2_leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "firma_adi" text,
  "yetkili_kisi" text,
  "telefon" text,
  "email" text,
  "ilgilendigi_hizmet" text,
  "durum" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "ilk_temas_tarihi" timestamp with time zone DEFAULT now(),
  "son_gorusme_tarihi" timestamp with time zone,
  "bir_sonraki_aksiyon" text,
  "sorumlu_staff_id" uuid
);


CREATE TABLE IF NOT EXISTS "v2_log_tasks" (
  "log_id" uuid NOT NULL,
  "task_id" uuid NOT NULL
);


CREATE TABLE IF NOT EXISTS "v2_notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "title" text,
  "message" text,
  "type" text,
  "is_read" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "v2_performance_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" uuid,
  "staff_id" uuid,
  "yonetici" text,
  "puan" integer,
  "geri_bildirim" text,
  "tarih" date DEFAULT CURRENT_DATE,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "v2_projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id" uuid,
  "proje_adi" text,
  "baslangic_tarihi" date DEFAULT CURRENT_DATE,
  "bitis_tarihi" date,
  "durum" text,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "v2_staff" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "isim" text NOT NULL,
  "rol" text,
  "performans_puani" numeric DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "v2_studio_shoots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid,
  "tarih" date NOT NULL,
  "sure" text,
  "durum" text,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "v2_task_activity" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" uuid,
  "user_name" text,
  "action" text,
  "old_value" text,
  "new_value" text,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "v2_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid,
  "gorev_adi" text,
  "atanmis_calisan" text,
  "son_teslim_tarihi" date,
  "durum" text,
  "brief" text,
  "dosyalar" jsonb,
  "oncelik" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "staff_id" uuid
);


CREATE TABLE IF NOT EXISTS "v3_activity_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "islem_tipi" text,
  "detay" text,
  "kullanici" text,
  "hedef_id" uuid,
  "created_at" timestamp with time zone DEFAULT now()
);

INSERT INTO "v3_activity_log" ("id", "islem_tipi", "detay", "kullanici", "hedef_id", "created_at") VALUES ('55794380-2fab-4166-9743-ab0c0fd7d120', 'Otomatik Fail', '"Sahne marin drone çekimi yapılacak" süresi dolduğu için otomatik başarısız yapıldı.', 'Arda Furkan Aslanbaş', '114e1d67-405e-494e-8c78-b5d600bd6c80', '2026-04-17T11:25:30.965Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_activity_log" ("id", "islem_tipi", "detay", "kullanici", "hedef_id", "created_at") VALUES ('51c6186a-21c6-4bfb-aa75-f97936196e12', 'Otomatik Fail', '"Sahne marin drone çekimi yapılacak" süresi dolduğu için otomatik başarısız yapıldı.', 'Arda Furkan Aslanbaş', '114e1d67-405e-494e-8c78-b5d600bd6c80', '2026-04-17T11:25:31.017Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_activity_log" ("id", "islem_tipi", "detay", "kullanici", "hedef_id", "created_at") VALUES ('d00040ab-6a5d-4dd0-892b-a1401f49f4e7', 'Otomatik Fail', '"Arayan Var Meta Hesabı kurulacak." süresi dolduğu için otomatik başarısız yapıldı.', 'Arda Furkan Aslanbaş', 'ac87c6fd-5146-4cd6-a5fb-3eb73486be45', '2026-04-18T09:01:56.600Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_activity_log" ("id", "islem_tipi", "detay", "kullanici", "hedef_id", "created_at") VALUES ('4d87ca13-5437-4d10-bdef-f1e1e04133d7', 'Otomatik Fail', '"Socketta icon" süresi dolduğu için otomatik başarısız yapıldı.', 'Arda Furkan Aslanbaş', '45ca955c-4d4f-4f42-b7e7-0d7ec77ea32f', '2026-04-18T09:01:56.742Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_activity_log" ("id", "islem_tipi", "detay", "kullanici", "hedef_id", "created_at") VALUES ('2e9d859d-91b3-4b7b-82be-a5885ce39a55', 'Otomatik Fail', '"Arayan Var  3''lü Grid Brief whatsapptan ilettim." süresi dolduğu için otomatik başarısız yapıldı.', 'Arda Furkan Aslanbaş', '583b1f41-7fc3-4a35-817d-0491cf32df8f', '2026-04-18T09:01:56.745Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_activity_log" ("id", "islem_tipi", "detay", "kullanici", "hedef_id", "created_at") VALUES ('c2b5e8a0-8b12-4845-800c-540b16dd3d34', 'Otomatik Fail', '"Socketta icon" süresi dolduğu için otomatik başarısız yapıldı.', 'Arda Furkan Aslanbaş', '45ca955c-4d4f-4f42-b7e7-0d7ec77ea32f', '2026-04-18T09:01:56.886Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_activity_log" ("id", "islem_tipi", "detay", "kullanici", "hedef_id", "created_at") VALUES ('1135f44f-eb58-424b-8cd6-9e36a8ee54a9', 'Otomatik Fail', '"google ads performans marketing reklamı çıkılacak. Bununla ilgili kreatif briefi" süresi dolduğu için otomatik başarısız yapıldı.', 'Arda Furkan Aslanbaş', '67c75a49-760b-43b0-9c9d-13b56f28c7e7', '2026-04-18T09:01:56.886Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_activity_log" ("id", "islem_tipi", "detay", "kullanici", "hedef_id", "created_at") VALUES ('89c58abf-2594-4b1d-a360-5bfd9668f542', 'Otomatik Fail', '"Arayan Var  3''lü Grid Brief whatsapptan ilettim." süresi dolduğu için otomatik başarısız yapıldı.', 'Arda Furkan Aslanbaş', '583b1f41-7fc3-4a35-817d-0491cf32df8f', '2026-04-18T09:01:56.893Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_activity_log" ("id", "islem_tipi", "detay", "kullanici", "hedef_id", "created_at") VALUES ('e7cf03ec-cc40-4775-afea-26bdaa040b17', 'Otomatik Fail', '"google ads performans marketing reklamı çıkılacak. Bununla ilgili kreatif briefi" süresi dolduğu için otomatik başarısız yapıldı.', 'Arda Furkan Aslanbaş', '67c75a49-760b-43b0-9c9d-13b56f28c7e7', '2026-04-18T09:01:57.019Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_activity_log" ("id", "islem_tipi", "detay", "kullanici", "hedef_id", "created_at") VALUES ('16cbc281-c449-4079-b6ba-4b0082eeb410', 'Otomatik Fail', '"Arayan Var Meta Hesabı kurulacak." süresi dolduğu için otomatik başarısız yapıldı.', 'Arda Furkan Aslanbaş', 'ac87c6fd-5146-4cd6-a5fb-3eb73486be45', '2026-04-18T09:01:57.051Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_activity_log" ("id", "islem_tipi", "detay", "kullanici", "hedef_id", "created_at") VALUES ('119b34b7-0e18-442e-a88e-ed0a61622420', 'Yeni Görev Atandı', '"Deneme" (Fotoğraf) görevi eklendi.', 'Arda Furkan Aslanbaş', NULL, '2026-04-21T14:46:22.188Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_activity_log" ("id", "islem_tipi", "detay", "kullanici", "hedef_id", "created_at") VALUES ('f448293c-132d-4a94-8347-c0c5ff24c313', 'Görev Durumu Değişti', '"Deneme" durumu "yapılıyor" yapıldı.', 'Furkan', '01da7c24-33b1-47e2-8f11-ac246702e835', '2026-04-22T10:15:11.886Z') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "v3_ads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "campaign_id" uuid,
  "ad_name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now()
);

INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('92161ac2-7249-4c04-b89b-eb8fd0d106b6', '92b32787-e6bb-42af-b363-bdc86fa2d4ea', 'S.K.1', '2026-04-22T15:24:46.402Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('90b335e6-4b46-4de3-b2bf-0e098b6f2cc5', '92b32787-e6bb-42af-b363-bdc86fa2d4ea', 'Diğer', '2026-04-22T15:24:46.733Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('42ddd7bd-9ce5-42b7-9d7a-4669f3c9b8de', '92b32787-e6bb-42af-b363-bdc86fa2d4ea', 'Kurumsal', '2026-04-22T15:24:47.097Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('93b9d8d0-3b31-41eb-a112-09d7f01d52f9', '5910dcc8-f3a3-4c8c-bc97-b9cc123fb6f8', 'Furkan - Potansiyel Müşteri Şablonu', '2026-04-22T15:24:48.125Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('a2bdc982-345c-45e2-b459-f8206b4bb0cb', '65d495e0-669c-47ba-a1d4-08fa10afad37', 'Yeni Potansiyel Müşteriler Reklamı', '2026-04-22T15:24:49.129Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('374b6ae4-f860-4bd8-b472-9d3f65f99310', '1759de33-11b0-4904-bea3-ef5b8771b87f', 'Test - reklam 1', '2026-04-22T15:24:50.178Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('41af4d4d-6188-448b-9de5-d60f73e85cd0', '1759de33-11b0-4904-bea3-ef5b8771b87f', 'Test - reklam 3', '2026-04-22T15:24:50.538Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('722e421e-0e66-4c0b-be56-8a875831b804', '1759de33-11b0-4904-bea3-ef5b8771b87f', 'Test - reklam 2', '2026-04-22T15:24:50.861Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('3ab41f8c-3f8b-4e44-b636-57b7b69287e0', '47c16cfe-567a-42e7-9ac5-865d18755f68', 'Etkileşim Reklam seti 1', '2026-04-22T15:24:51.898Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('0ec769e3-61f9-4b55-be94-9dc27067dee5', '53dc94e0-9c5a-4f54-a204-935e1b9ae3d2', 'Social Art Agency 1', '2026-04-22T15:24:55.402Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('ba2f2e7a-8adc-4685-b436-2d30305a70da', 'a218aa5e-585f-49fb-83bf-00de46e926ec', '3', '2026-04-22T15:24:56.423Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('316dc26c-0dc2-43a4-bbb8-693b4fcb10dc', 'a218aa5e-585f-49fb-83bf-00de46e926ec', '2', '2026-04-22T15:24:56.791Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('716339a8-7736-4941-af57-0fb57e9b1f0b', 'a218aa5e-585f-49fb-83bf-00de46e926ec', '1', '2026-04-22T15:24:57.139Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('b96dc2c1-9538-4192-8cc1-beea34dff9b2', '2ba11dae-8e84-4257-8247-08de143fd8f3', '1 Milyon TL | Tanıtım 1', '2026-04-22T15:24:58.197Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('717ac1ee-5e7e-4c9c-a896-87376e3dcd66', '2ba11dae-8e84-4257-8247-08de143fd8f3', '1 Milyon TL | Tanıtım 7', '2026-04-22T15:24:58.522Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('cbd4ae2a-7d42-465e-8697-e2581c120350', '2ba11dae-8e84-4257-8247-08de143fd8f3', '1 Milyon TL | Tanıtım 8', '2026-04-22T15:24:58.882Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('7a1e3051-f089-4c1b-8d02-29c0434e5e7f', '2ba11dae-8e84-4257-8247-08de143fd8f3', '1 Milyon TL | Tanıtım 5', '2026-04-22T15:24:59.567Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('602fae58-4fad-44c5-8bcd-84f8df6d9830', '2ba11dae-8e84-4257-8247-08de143fd8f3', '1 Milyon TL | Tanıtım 3', '2026-04-22T15:25:00.093Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('79415b15-f747-48eb-a1fd-64d4803510ee', '2ba11dae-8e84-4257-8247-08de143fd8f3', '1 Milyon TL | Tanıtım 9', '2026-04-22T15:25:00.627Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('55cf4ab0-05be-4fc1-991d-9031be4a63a2', '2ba11dae-8e84-4257-8247-08de143fd8f3', '1 Milyon TL | Tanıtım 4', '2026-04-22T15:25:01.672Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('2125cb5c-1f33-47eb-9b64-4440dba7d0e8', '2ba11dae-8e84-4257-8247-08de143fd8f3', '1 Milyon TL | Tanıtım 4 - 1', '2026-04-22T15:25:02.537Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('0f93d00e-e383-4b85-81e7-8a45bddf5155', '2ba11dae-8e84-4257-8247-08de143fd8f3', '1 Milyon TL | Tanıtım 6', '2026-04-22T15:25:02.893Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('c5583216-ce15-49b0-9359-2aeb8e465e93', '2ba11dae-8e84-4257-8247-08de143fd8f3', '1 Milyon TL | Tanıtım', '2026-04-22T15:25:03.409Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('80899a34-a2a6-4a9a-85e7-9e66c5c43ece', '2ba11dae-8e84-4257-8247-08de143fd8f3', '1 Milyon TL | Tanıtım 2', '2026-04-22T15:25:03.766Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('0f56ab19-f5ae-4319-a562-b85b42bf8000', 'd3be562e-9073-44fb-ad8a-ac8f4d49fd64', '1-2 Hafta bilinirlik', '2026-04-22T15:25:09.618Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('33311596-8492-48e4-a012-e91b66a6686c', 'd3be562e-9073-44fb-ad8a-ac8f4d49fd64', '1 - 2 Hafta bilinirlik CTA', '2026-04-22T15:25:09.969Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('08af1324-5491-4afc-831b-cf8185a38e0c', 'b8ff4961-af3c-4410-b6d9-a75ca43cd510', 'Potansiyel', '2026-04-22T15:25:10.996Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('7d8c5d90-6a42-4be6-b0c1-2fb4920b3175', 'da196fac-3b7b-45b3-b69e-6e9eaaf4af45', '06.06.2025 Marka tanıtımı', '2026-04-22T15:25:12.027Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('8c3b09d2-d74d-4b49-8e32-cf6fe4ef13a7', '5f65e88e-529e-40de-b031-a5b61f1c2bca', '02.06 Trafik Maalesef olmaz', '2026-04-22T15:25:13.431Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('1fcb2628-4db6-44d7-8d3d-d7c872359130', '1fa40bff-fae8-485b-995a-cf2d09038200', '01.06.2025 Socialart Showreel Müşteri Avı', '2026-04-22T15:25:14.456Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('14c6bc72-22b0-4e15-915f-9cfd56e182eb', 'e9a528ad-0243-47c9-85dc-aef92ecad9fd', '01.06.2025 Socialart "Maalesef olmaz" Müşteri Avı', '2026-04-22T15:25:15.559Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('52c190eb-e01e-40a1-8c22-76559c35fca0', '75dc2479-0445-4164-a51d-a96b18a98dc8', 'reeels anadolu A', '2026-04-22T15:25:16.692Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('341500b0-08c2-4d2b-94da-411fad72101b', 'c6935ce5-0ce8-4f5a-8537-109bbfab0400', 'reeels anadolu B', '2026-04-22T15:25:17.758Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_ads" ("id", "campaign_id", "ad_name", "created_at") VALUES ('0aaa28ad-1d6d-4050-aaed-7a02cd2245d4', 'faf08d8e-816f-4a28-a59b-07de25936c69', 'Socialart Showreel Müşteri Avı', '2026-04-22T15:25:18.813Z') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "v3_calendar" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tip" text NOT NULL,
  "musteri_id" uuid,
  "proje_id" uuid,
  "tarih" date NOT NULL,
  "saat" text,
  "notlar" text,
  "created_at" timestamp with time zone DEFAULT now()
);

INSERT INTO "v3_calendar" ("id", "tip", "musteri_id", "proje_id", "tarih", "saat", "notlar", "created_at") VALUES ('d4bf878c-dfa4-4f46-a0ef-3d867514ebf3', 'cekim', NULL, NULL, '2026-04-21T21:00:00.000Z', '12:00', 'sunucu çekimi — Ekip: Ercan Celal', '2026-04-17T10:37:40.929Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_calendar" ("id", "tip", "musteri_id", "proje_id", "tarih", "saat", "notlar", "created_at") VALUES ('aa368fca-79e0-458b-b66b-5916fee0c97c', 'cekim', NULL, NULL, '2026-04-15T21:00:00.000Z', '19:00', 'Döner Evim Pendik — Ekip: Celal, Ercan', '2026-04-17T10:37:40.929Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_calendar" ("id", "tip", "musteri_id", "proje_id", "tarih", "saat", "notlar", "created_at") VALUES ('5d838439-1bba-4cca-be39-b77799d6d688', 'cekim', NULL, NULL, '2026-04-15T21:00:00.000Z', '20:00', 'Sahne Marin Drone Çekimi — Ekip: Ercan', '2026-04-17T10:37:40.929Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_calendar" ("id", "tip", "musteri_id", "proje_id", "tarih", "saat", "notlar", "created_at") VALUES ('49b7650e-7d3c-4a0e-b1ca-1ed7a400a3d1', 'toplanti', NULL, NULL, '2026-04-16T21:00:00.000Z', '12:00', 'Özge Hanım gelecek — Ekip: Celal, Ercan, Furkan', '2026-04-17T10:37:40.929Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_calendar" ("id", "tip", "musteri_id", "proje_id", "tarih", "saat", "notlar", "created_at") VALUES ('b2f6b55a-2506-4761-ba89-5c6221e198c9', 'cekim', NULL, NULL, '2026-04-22T21:00:00.000Z', NULL, 'miocasa''ya  çekim ', '2026-04-23T12:09:21.015Z') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "v3_campaigns" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "platform" text,
  "status" text,
  "budget" numeric DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now()
);

INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('92b32787-e6bb-42af-b363-bdc86fa2d4ea', 'Sunuculu Reklam Tanıtımı Hizmeti İçin 14.04.26', 'Meta', 'Aktif', '0', '2026-04-22T15:24:45.673Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('5910dcc8-f3a3-4c8c-bc97-b9cc123fb6f8', 'Furkan - SocialArt', 'Meta', 'Pasif', '0', '2026-04-22T15:24:47.435Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('65d495e0-669c-47ba-a1d4-08fa10afad37', 'Yeni Potansiyel Müşteriler Kampanyası', 'Meta', 'Pasif', '0', '2026-04-22T15:24:48.487Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('1759de33-11b0-4904-bea3-ef5b8771b87f', 'etk- Social Art Reklam Kampanya', 'Meta', 'Pasif', '0', '2026-04-22T15:24:49.489Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('47c16cfe-567a-42e7-9ac5-865d18755f68', 'Social Art Etkileşim Reklamı Kampanya', 'Meta', 'Pasif', '0', '2026-04-22T15:24:51.214Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('a518421e-fcfc-4b9d-8aa8-d5cae847cc5b', 'Social Art Potansiyel Müşteri Kampanyası', 'Meta', 'Pasif', '0', '2026-04-22T15:24:52.240Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('53dc94e0-9c5a-4f54-a204-935e1b9ae3d2', 'Social Art Bilinirlik Reklamı', 'Meta', 'Pasif', '0', '2026-04-22T15:24:54.699Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('a218aa5e-585f-49fb-83bf-00de46e926ec', 'Etkileşim', 'Meta', 'Pasif', '0', '2026-04-22T15:24:55.766Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('2ba11dae-8e84-4257-8247-08de143fd8f3', '1 Milyon TL 1', 'Meta', 'Pasif', '0', '2026-04-22T15:24:57.501Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('25676b14-d06b-4231-a334-bb39e7658844', '1 Milyon TL', 'Meta', 'Pasif', '0', '2026-04-22T15:25:04.798Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('d3be562e-9073-44fb-ad8a-ac8f4d49fd64', '1-2 Hafta bilinirlik', 'Meta', 'Pasif', '0', '2026-04-22T15:25:08.978Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('b8ff4961-af3c-4410-b6d9-a75ca43cd510', 'Potansiyel müşteri Kampanya', 'Meta', 'Pasif', '0', '2026-04-22T15:25:10.315Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('da196fac-3b7b-45b3-b69e-6e9eaaf4af45', '06.06.2025 Marka tanıtımı', 'Meta', 'Pasif', '0', '2026-04-22T15:25:11.340Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('5f65e88e-529e-40de-b031-a5b61f1c2bca', '02.06 Trafik Maalesef olmaz', 'Meta', 'Pasif', '0', '2026-04-22T15:25:12.708Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('1fa40bff-fae8-485b-995a-cf2d09038200', '01.06.2025 Socialart Showreel Müşteri Avı', 'Meta', 'Pasif', '0', '2026-04-22T15:25:13.780Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('e9a528ad-0243-47c9-85dc-aef92ecad9fd', '01.06.2025 Socialart "Maalesef olmaz" Müşteri Avı', 'Meta', 'Pasif', '0', '2026-04-22T15:25:14.815Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('75dc2479-0445-4164-a51d-a96b18a98dc8', 'Test - reels etkileşim', 'Meta', 'Pasif', '0', '2026-04-22T15:25:15.913Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('c6935ce5-0ce8-4f5a-8537-109bbfab0400', 'reels etkileşim', 'Meta', 'Pasif', '0', '2026-04-22T15:25:17.045Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_campaigns" ("id", "name", "platform", "status", "budget", "created_at") VALUES ('faf08d8e-816f-4a28-a59b-07de25936c69', 'Socialart Showreel Müşteri Avı', 'Meta', 'Pasif', '0', '2026-04-22T15:25:18.115Z') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "v3_clients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "marka_adi" text NOT NULL,
  "yetkili_kisi" text,
  "telefon" text,
  "email" text,
  "sektor" text,
  "calisma_baslangic_tarihi" date,
  "son_gorusme_tarihi" date,
  "created_at" timestamp with time zone DEFAULT now()
);

INSERT INTO "v3_clients" ("id", "marka_adi", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "son_gorusme_tarihi", "created_at") VALUES ('1a7052c7-c274-4098-9043-06ed7f7f4384', 'Döner Evim Pendik', '-', '-', '-', '-', '2026-04-07T21:00:00.000Z', '2026-04-07T21:00:00.000Z', '2026-04-17T10:37:40.572Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_clients" ("id", "marka_adi", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "son_gorusme_tarihi", "created_at") VALUES ('3ac13435-e7f5-4789-8143-bf6f837f15ff', 'Arayanvar', '-', '-', '-', '-', '2026-04-14T21:00:00.000Z', '2026-04-14T21:00:00.000Z', '2026-04-17T10:37:40.572Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_clients" ("id", "marka_adi", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "son_gorusme_tarihi", "created_at") VALUES ('67bccba3-1fd7-4ef1-aaab-f51160f43f3e', 'Karadeniz Et Lokantası', '-', '-', '-', '-', '2026-04-07T21:00:00.000Z', '2026-04-07T21:00:00.000Z', '2026-04-17T10:37:40.572Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_clients" ("id", "marka_adi", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "son_gorusme_tarihi", "created_at") VALUES ('f046c840-8e4a-460f-9f52-52d8f5e5835c', 'Socketta', '-', '-', '-', '-', '2026-04-07T21:00:00.000Z', '2026-04-07T21:00:00.000Z', '2026-04-17T10:37:40.572Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_clients" ("id", "marka_adi", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "son_gorusme_tarihi", "created_at") VALUES ('141b3604-469a-417a-a566-ee11e7c381d1', 'Mall Of Gurme', '-', '-', '-', '-', '2026-04-07T21:00:00.000Z', '2026-04-07T21:00:00.000Z', '2026-04-17T10:37:40.572Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_clients" ("id", "marka_adi", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "son_gorusme_tarihi", "created_at") VALUES ('abd6ab2e-78cd-4d3c-9f4c-0108df3bf308', 'VIP Catring', '-', '-', '-', '-', '2026-04-07T21:00:00.000Z', '2026-04-07T21:00:00.000Z', '2026-04-17T10:37:40.572Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_clients" ("id", "marka_adi", "yetkili_kisi", "telefon", "email", "sektor", "calisma_baslangic_tarihi", "son_gorusme_tarihi", "created_at") VALUES ('c58d6bfe-5b56-4bdd-8d24-ee3ab8f05a2c', 'Gurme Bahçeşehir', '-', '-', '-', '-', '2026-04-07T21:00:00.000Z', '2026-04-07T21:00:00.000Z', '2026-04-17T10:37:40.572Z') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "v3_daily_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "calisan_id" uuid,
  "tarih" date NOT NULL,
  "yapilan_isler" text,
  "harcanan_sure" integer,
  "notlar" text,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "v3_employees" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "isim" text NOT NULL,
  "rol" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now()
);

INSERT INTO "v3_employees" ("id", "isim", "rol", "created_at") VALUES ('d463c233-5013-41a6-bebc-d308bc8927ec', 'Tuğba', 'Sosyal Medya Uzmanı', '2026-04-17T10:37:40.406Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_employees" ("id", "isim", "rol", "created_at") VALUES ('191b738d-900f-4273-a037-c4824d7c2245', 'Celal', 'Kurucu', '2026-04-17T10:37:40.406Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_employees" ("id", "isim", "rol", "created_at") VALUES ('1b7774f6-b8e5-43c2-8b7d-da93e910943a', 'Ercan', 'Kurucu', '2026-04-17T10:37:40.406Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_employees" ("id", "isim", "rol", "created_at") VALUES ('cc9ba8a9-8ae0-4d0f-a0ab-40655f720b57', 'Betül', 'ART Direktör', '2026-04-17T10:37:40.406Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_employees" ("id", "isim", "rol", "created_at") VALUES ('c242419f-ea94-4af9-80bd-3f0c1cd5e669', 'Simge', 'Sosyal Medya Specialist', '2026-04-17T10:37:40.406Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_employees" ("id", "isim", "rol", "created_at") VALUES ('f7ca8d73-17ae-4983-8d00-6795c163213c', 'Furkan', 'Dijital Pazarlama Uzmanı', '2026-04-17T10:37:40.406Z') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "v3_meetings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "marka_id" uuid,
  "tarih" date,
  "gorusulen_kisi" text,
  "notlar" text,
  "sonraki_adim" text,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "v3_notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "hedef_rol" text,
  "mesaj" text,
  "tip" text,
  "okundu_mu" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "v3_performances" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "gorev_id" uuid,
  "calisan_id" uuid,
  "puan" integer,
  "yorum" text,
  "created_at" timestamp with time zone DEFAULT now()
);


CREATE TABLE IF NOT EXISTS "v3_projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "proje_adi" text NOT NULL,
  "musteri_id" uuid,
  "durum" text,
  "created_at" timestamp with time zone DEFAULT now()
);

INSERT INTO "v3_projects" ("id", "proje_adi", "musteri_id", "durum", "created_at") VALUES ('2d1ad2ab-8ff3-4554-9b8e-6c48547f36ce', 'Genel Görevler', NULL, 'devam_ediyor', '2026-04-17T10:37:41.093Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_projects" ("id", "proje_adi", "musteri_id", "durum", "created_at") VALUES ('6fb39542-1368-4f34-b3e6-502676c956c2', 'Sunuculu Reklam Videosu çekiliyor', '3ac13435-e7f5-4789-8143-bf6f837f15ff', 'devam_ediyor', '2026-04-22T12:18:57.545Z') ON CONFLICT DO NOTHING;
INSERT INTO "v3_projects" ("id", "proje_adi", "musteri_id", "durum", "created_at") VALUES ('d48b7558-7735-401d-a9dc-2a719363810e', 'deneme', '1a7052c7-c274-4098-9043-06ed7f7f4384', 'devam_ediyor', '2026-04-22T13:26:54.295Z') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "v3_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "gorev_adi" text NOT NULL,
  "brief" text,
  "dosya_url" text,
  "proje_id" uuid,
  "atanmis_calisan" uuid,
  "deadline" date NOT NULL,
  "durum" text NOT NULL,
  "tamamlama_notu" text,
  "oncelik" text,
  "revizyon_sayisi" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "atayan_isim" text,
  "brief_talebi" boolean DEFAULT false,
  "ek_sure_talebi" text
);

INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('3fba773f-2581-4181-ad69-38d91693daac', '15.04.2026 çekimi için döner evime içerik stratejisi hazırlanacak.', '15.04.2026 çekimi için döner evime içerik stratejisi hazırlanacak.', NULL, NULL, 'c242419f-ea94-4af9-80bd-3f0c1cd5e669', '2026-04-16T21:00:00.000Z', 'tamamlandı', NULL, 'Normal', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('0e9b24a6-ffed-431d-9a0b-1d6b7fea5477', 'Döner Evim  1) Mayıs ayı için seçilen videolardaki yazı düzenlemelerini tamamlan', 'Döner Evim

1) Mayıs ayı için seçilen videolardaki yazı düzenlemelerini tamamlanacak

 2) Reels kurgularını finalize et ve yayına hazır hale getirilecek.

 3) WhatsApp konum kaydı sürecini takip edilecek ve onay durumunu kontrol edilecek.', NULL, NULL, 'd463c233-5013-41a6-bebc-d308bc8927ec', '2026-04-16T21:00:00.000Z', 'tamamlandı', NULL, 'Normal', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('54c0bafc-c5da-48fe-93b9-7cb89bf78984', 'Gurme Bahçeşehir  1) Yeni çekimler arasından Reels içerik seçimleri tamamlanacak', 'Gurme Bahçeşehir

1) Yeni çekimler arasından Reels içerik seçimleri tamamlanacak

2) Özge Hanım’dan gelen revizeler uygulanarak içerikler güncellenecek
 
3) Güncellenen içerikler paylaşım planına dahil edilecek', NULL, NULL, 'd463c233-5013-41a6-bebc-d308bc8927ec', '2026-04-16T21:00:00.000Z', 'tamamlandı', NULL, 'Normal', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('9510db68-a684-479a-a5b0-5f80fe530ebb', 'İçerik Planlama & Paylaşım   1) Tüm markalar için story paylaşımları düzenli ola', 'İçerik Planlama & Paylaşım

 1) Tüm markalar için story paylaşımları düzenli olarak sürdürülecek

 2) Planlanan gönderilerin yayın takibi yapılacak

3) Karadeniz Et Lokantası gönderisinin performansı analiz edilecek', NULL, NULL, 'd463c233-5013-41a6-bebc-d308bc8927ec', '2026-04-16T21:00:00.000Z', 'tamamlandı', NULL, 'Normal', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('4db22575-4b85-4b2f-9e0b-3ca4d35ed0df', 'PhantomBuster & Lead Generation   1) Toplanan 200+ e-posta verisini kontrol edil', 'PhantomBuster & Lead Generation

 1) Toplanan 200+ e-posta verisini kontrol edilecek (doğruluk & tekrar edenler)

2)  Excel datası segmentlere ayrılacak (plaza / şirket / sektör vb.)

3) Lead’ler için iletişim veya kampanya planı oluşturulacak.', NULL, NULL, 'd463c233-5013-41a6-bebc-d308bc8927ec', '2026-04-16T21:00:00.000Z', 'tamamlandı', NULL, 'Normal', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('4cb7a6c9-fff0-47e5-b68d-80b20012577e', 'sunucu videosunu google ads''de çıkmak istiyoruz o sebeple videonun aşağıda veril', 'sunucu videosunu google ads''de çıkmak istiyoruz o sebeple videonun aşağıda verilen ölçülerine uygun boyutlarını rica edeceğim.


1920 x 1080
1080 x 1920
1080 x 1080', NULL, NULL, '1b7774f6-b8e5-43c2-8b7d-da93e910943a', '2026-04-16T21:00:00.000Z', 'tamamlandı', NULL, 'Kritik', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('7400a939-bb3d-4612-8002-15100e2191db', 'çekim takviminizi bizlerle paylaşmanızı rica edeceğiz. gitmeden markaya strateji', 'çekim takviminizi bizlerle paylaşmanızı rica edeceğiz. gitmeden markaya strateji sunumlarını önceden hazırlamış oluruz.', NULL, NULL, '191b738d-900f-4273-a037-c4824d7c2245', '2026-04-16T21:00:00.000Z', 'tamamlandı', NULL, 'Normal', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('fc069f37-fddf-46f3-875a-652b2c281ccf', 'Arayan Var 3lü Grid için Breif hazırlanacak.', 'Arayan Var 3lü Grid için Breif hazırlanacak.', NULL, NULL, 'c242419f-ea94-4af9-80bd-3f0c1cd5e669', '2026-04-16T21:00:00.000Z', 'tamamlandı', NULL, 'Normal', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('42c0512d-684b-40d2-9a0b-4f47ef463a83', 'metada sunuculu reklam kreatifleri çıkılacak.', 'metada sunuculu reklam kreatifleri çıkılacak.', NULL, NULL, 'f7ca8d73-17ae-4983-8d00-6795c163213c', '2026-04-16T21:00:00.000Z', 'tamamlandı', NULL, 'Normal', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('114e1d67-405e-494e-8c78-b5d600bd6c80', 'Sahne marin drone çekimi yapılacak', 'Sahne marin drone çekimi yapılacak', NULL, NULL, '1b7774f6-b8e5-43c2-8b7d-da93e910943a', '2026-04-15T21:00:00.000Z', 'yapılacak', NULL, 'Kritik', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('583b1f41-7fc3-4a35-817d-0491cf32df8f', 'Arayan Var  3''lü Grid Brief whatsapptan ilettim.', 'Arayan Var  3''lü Grid Brief whatsapptan ilettim.', NULL, NULL, '1b7774f6-b8e5-43c2-8b7d-da93e910943a', '2026-04-16T21:00:00.000Z', 'yapılacak', NULL, 'Normal', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('ac87c6fd-5146-4cd6-a5fb-3eb73486be45', 'Arayan Var Meta Hesabı kurulacak.', 'Arayan Var Meta Hesabı kurulacak.', NULL, NULL, 'c242419f-ea94-4af9-80bd-3f0c1cd5e669', '2026-04-16T21:00:00.000Z', 'yapılacak', NULL, 'Normal', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('45ca955c-4d4f-4f42-b7e7-0d7ec77ea32f', 'Socketta icon', 'Socketta icon', NULL, NULL, '1b7774f6-b8e5-43c2-8b7d-da93e910943a', '2026-04-16T21:00:00.000Z', 'yapılacak', NULL, 'Normal', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('34dab955-2453-432d-bd26-65b83ca2f8f1', 'arayan var markası için   1) strateji sunumu hazırlandı. 2) influencer listesi h', 'arayan var markası için 

1) strateji sunumu hazırlandı.
2) influencer listesi hazırlandı, bütçe alınıp tabloya girildii.
3) ugc listesi hazırlandı.
4) cast sunumu hazırlandı.

ercana teslim edildi.
', NULL, NULL, 'c242419f-ea94-4af9-80bd-3f0c1cd5e669', '2026-04-16T21:00:00.000Z', 'tamamlandı', NULL, 'Normal', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('67c75a49-760b-43b0-9c9d-13b56f28c7e7', 'google ads performans marketing reklamı çıkılacak. Bununla ilgili kreatif briefi', 'google ads performans marketing reklamı çıkılacak. Bununla ilgili kreatif briefini betüle vereceğim sen reklamı kurabilirsin.', NULL, NULL, 'f7ca8d73-17ae-4983-8d00-6795c163213c', '2026-04-16T21:00:00.000Z', 'yapılacak', NULL, 'Normal', 0, '2026-04-17T10:37:40.766Z', NULL, false, NULL) ON CONFLICT DO NOTHING;
INSERT INTO "v3_tasks" ("id", "gorev_adi", "brief", "dosya_url", "proje_id", "atanmis_calisan", "deadline", "durum", "tamamlama_notu", "oncelik", "revizyon_sayisi", "created_at", "atayan_isim", "brief_talebi", "ek_sure_talebi") VALUES ('01da7c24-33b1-47e2-8f11-ac246702e835', 'Deneme', 'deneme deneme deneme', NULL, '2d1ad2ab-8ff3-4554-9b8e-6c48547f36ce', 'f7ca8d73-17ae-4983-8d00-6795c163213c', '2026-04-21T21:00:00.000Z', 'yapılıyor', NULL, 'Kritik', 0, '2026-04-21T14:46:21.990Z', 'Simge', true, NULL) ON CONFLICT DO NOTHING;

