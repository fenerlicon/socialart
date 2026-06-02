# GEO (Yapay Zeka Arama Optimizasyonu) İçerik ve Yazım Rehberi

Yapay zeka arama motorlarının (ChatGPT, Google Gemini, Perplexity, Claude, Copilot vb.) markamızı ve müşterilerimizin web sitelerini doğrudan bulması, doğru anlamlandırması ve kullanıcı sorgularında **kaynak göstererek önermesi** için hazırlanan pratik içerik üretim rehberidir.

---

## 1. GEO Neden Önemlidir?
Geleneksel SEO, kullanıcıyı "mavi linkler" listesine yönlendirmeyi amaçlar. **GEO (Generative Engine Optimization)** ise yapay zekanın kullanıcı sorusuna sentezleyerek ürettiği cevapta **bizim sitemizden alıntı yapmasını ve doğrudan sitemizi referans (citation) olarak göstermesini** sağlar.

---

## 2. Altın Kurallar: Yapay Zekaların Sevdiği İçerik Nasıl Yazılır?

### Kural 1: "Answer-First" (Önce Cevap) Yapısı
Yapay zeka modelleri hızlıca bilgi çekmek ister. Blog yazılarında veya hizmet sayfalarında uzun giriş cümleleri kurmak yerine, sorunun veya konunun cevabını **ilk paragrafta, ilk 2-3 cümlede net bir şekilde** verin.
*   **Yanlış örnek:** *"Sosyal medya yönetimi günümüzde şirketlerin cirolarını artırmak için kullandığı, son 10 yıldır hayatımızda olan ve sürekli değişen dinamikleri barındıran çok önemli bir sektördür..."* (Giriş çok uzun ve bilgi vermiyor).
*   **Doğru örnek:** *"Sosyal medya yönetimi; markaların sosyal mecralarda hedef kitle analizinden kreatif üretime, reklam bütçesi optimizasyonundan topluluk yönetimine kadar tüm süreçlerini kapsayan profesyonel bir büyüme hizmetidir."* (Net tanım ilk cümlede).

### Kural 2: Bilgi Tabloları ve Karşılaştırmalar Kullanın
Yapay zekalar veri tablosu formatındaki yapıları çok sever ve kıyaslama yapan kullanıcılara bu tabloları doğrudan sunarlar.
*   Yazılarınızın içine hizmet paketleri karşılaştırmaları, süreç adımları veya bütçe verimlilik tabloları ekleyin (Örn: *Farklı Sosyal Medya Platformlarının Dönüşüm Oranları Tablosu*).

### Kural 3: "Sıkça Sorulan Sorular" (SSS) ve Soru-Cevap Blokları
Her makalenin veya ana sayfa bölümünün sonuna mutlaka **soru-cevap (Q&A)** blokları ekleyin. 
*   Başlıkta soruyu net sorun (`H3` veya `H4` kullanarak): *"Meta reklam bütçesi nasıl belirlenir?"*
*   Hemen altında cevabı kısa, anlaşılır ve maddeli bir şekilde verin.

### Kural 4: E-E-A-T (Uzmanlık ve Güven) Sinyalleri Ekleyin
Yapay zekalar bilgiyi kimin yazdığına ve bu kişinin yetkinliğine çok önem verir.
*   Yazıların altında yazar biyografisi bulundurun. (Örn: *"Celal Ünlü tarafından yazılmıştır. Filmograf Studio Kurucusu ve Yönetmen"*).
*   Sayısal veriler ve istatistikler paylaştığınızda, bunları güvenilir dış kaynaklara link vererek destekleyin. Yapay zeka bu linkleri takip ederek sitemizin güvenilir bir kaynak olduğuna karar verir.

### Kural 5: Sadelik ve Jargondan Kaçınma
Anlam karmaşası yaratan cümlelerden kaçının. Yapay zekalar düz, mantıksal olarak birbirini takip eden ve hiyerarşik (H1 -> H2 -> H3) olarak bölünmüş sayfaları çok daha rahat analiz eder.

---

## 3. İçerik Yazarları İçin Kontrol Listesi (Checklist)

İçeriğinizi yayına almadan önce şu soruları sorun:
- [ ] Makale başında doğrudan tanım veya doğrudan cevap cümlesi yer alıyor mu?
- [ ] İçerikte en az bir adet yapılandırılmış liste (bullet point) veya veri tablosu var mı?
- [ ] Başlıklar (`h2`, `h3`, `h4`) mantıksal bir sırayla gidiyor mu?
- [ ] Konuyla ilgili sıkça sorulan 3-4 soru ve net cevabı metinde bulunuyor mu?
- [ ] Yazının yazarı ve yazarın uzmanlık alanı belirtilmiş mi?

---

## 4. GEO Görünürlüğü Nasıl Test Edilir?
1.  **AI Arama Testi:** ChatGPT Search, Perplexity ve Gemini'a müşterilerinizin arayabileceği niş soruları sorun.
    *   *Örnek:* *"İstanbul'da ROAS garantili çalışan sosyal medya ajansları hangileridir?"*
    *   *Örnek:* *"Restoranlar için Instagram reklam stratejileri nelerdir?"*
2.  **Referans Kontrolü:** AI motorlarının verdiği yanıtlarda sitemizi alıntılayıp alıntılamadığını kontrol edin. Alıntılamıyorsa, `llms.txt` veya JSON-LD şemalarınızda o konu başlığını daha belirgin hale getirin.
