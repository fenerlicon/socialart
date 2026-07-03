import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = {};
readFileSync('.env', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const sb = createClient(env['VITE_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

const newBlogs = [
  {
    id: 29,
    slug: 'meta-reklamlarda-erisim-neden-satis-anlamina-gelmez',
    title: 'Meta Reklamlarında Erişim Neden Satış Anlamına Gelmez?',
    excerpt: 'Meta reklamlarında yüksek erişim elde etmek her zaman satış yapacağınız anlamına gelmez. Satış için erişimin niteliği, dönüşüm hunisi (funnel) kurgusu ve kreatif uyumu belirleyicidir.',
    read_time: '5 dk okuma',
    cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    content: `
      <h2>Meta Reklamlarında Erişim ve Satış İlişkisi</h2>
      <p>Meta reklamlarında (Facebook ve Instagram Ads) yüksek erişim (reach) rakamları elde etmek, reklamlarınızın çok sayıda kişi tarafından görüntülendiğini gösterse de bu durum doğrudan satış anlamına gelmez. Çünkü erişim sadece bir görünürlük metriğidir; asıl satış ise doğru hedefleme, ilgi çekici kreatifler ve optimize edilmiş bir web sitesi dönüşüm hunisi (funnel) ile gerçekleşir. SocialArt Medya olarak yürüttüğümüz <a href="/meta-ads-yonetimi">Meta reklam yönetimi</a> süreçlerinde, erişim odaklı değil, dönüşüm ve ROAS odaklı stratejiler uyguluyoruz.</p>
      
      <h3>Erişim ve Satış Arasındaki Temel Farklar</h3>
      <p>Yüksek erişim rakamlarına rağmen neden satış yapamadığınızı anlamak için aşağıdaki farkları inceleyebilirsiniz:</p>
      <ul>
        <li><strong>Hedef Kitle Niteliksizliği:</strong> Reklamlarınız geniş bir kitleye ulaşıyor olabilir ancak bu kişiler ürününüzü satın alma potansiyeline sahip değilse erişim satışa dönüşmez.</li>
        <li><strong>Kreatif Yetersizliği:</strong> Reklam görseliniz veya Reels videonuz dikkat çekici değilse, kullanıcılar reklamı görse bile tıklamadan geçer.</li>
        <li><strong>Dönüşüm Hunisi (Funnel) Eksikliği:</strong> Web sitenize gelen kullanıcılar karmaşık ödeme adımları veya yavaş yüklenen sayfalarla karşılaşıyorsa sepeti terk eder.</li>
      </ul>

      <h3>Erişim ve Satış Metrikleri Karşılaştırma Tablosu</h3>
      <table border="1" style="width:100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #222; color: #fff;">
            <th style="padding: 10px;">Metrik</th>
            <th style="padding: 10px;">Tanımı</th>
            <th style="padding: 10px;">Büyümeye Etkisi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px;">Erişim (Reach)</td>
            <td style="padding: 10px;">Reklamı gören benzersiz kişi sayısı</td>
            <td style="padding: 10px;">Düşük (Sadece bilinirlik sağlar)</td>
          </tr>
          <tr>
            <td style="padding: 10px;">Tıklama Oranı (CTR)</td>
            <td style="padding: 10px;">Reklama tıklayanların oranı</td>
            <td style="padding: 10px;">Orta (İlgi düzeyini ölçer)</td>
          </tr>
          <tr>
            <td style="padding: 10px;">ROAS (Harcama Getirisi)</td>
            <td style="padding: 10px;">Reklam harcamasından elde edilen ciro</td>
            <td style="padding: 10px;">Çok Yüksek (Doğrudan karlılığı belirler)</td>
          </tr>
        </tbody>
      </table>

      <blockquote>Meta reklamlarında başarı, bütçeyi kimin daha çok kişiye gösterdiğinde değil; en doğru potansiyel alıcıya en düşük maliyetle ulaştırıp satışa çevirebilmesindedir.</blockquote>

      <p><strong>Yazar:</strong> Celal Ünlü, SocialArt Medya Kurucusu & Yönetmen. Dijital reklam kreatifleri ve büyüme stratejileri uzmanı.</p>
    `.trim()
  },
  {
    id: 30,
    slug: 'bir-markanin-reklam-kreatifleri-performansi-neden-dusurur',
    title: 'Bir Markanın Reklam Kreatifleri Performansı Neden Düşürür?',
    excerpt: 'Kötü veya yanlış kurgulanmış reklam kreatifleri, hedefleme ne kadar mükemmel olursa olsun reklam performansını düşürür ve bütçenizi tüketir. İşte nedenleri.',
    read_time: '4 dk okuma',
    cover_image: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=800',
    content: `
      <h2>Reklam Kreatiflerinin Performans Üzerindeki Etkisi</h2>
      <p>Bir markanın reklam kreatifleri; ilk 3 saniyede kullanıcının dikkatini çekemiyorsa, net bir değer teklifi sunmuyorsa veya platformun dinamiklerine uymuyorsa reklam performansını doğrudan düşürür. Günümüzde Meta ve Google algoritmaları hedeflemeyi büyük ölçüde otomatikleştirmiştir; bu nedenle reklam performansını belirleyen en önemli unsur kreatif kalitesidir. SocialArt Medya olarak <a href="/creative-production">kreatif prodüksiyon</a> süreçlerimizde, estetik görsel kaygıların yanında dönüşüm getiren performans kreatifleri üretiyoruz.</p>

      <h3>Kreatiflerin Reklam Performansını Düşürmesinin 4 Temel Nedeni</h3>
      <ul>
        <li><strong>Kanca (Hook) Eksikliği:</strong> Sosyal medya kullanıcıları çok hızlı kaydırma yapar. Reklam videonuz ilk 3 saniyede izleyiciyi durduramıyorsa bütçeniz boşa gider.</li>
        <li><strong>Net Olmayan Eylem Çağrısı (CTA):</strong> Kullanıcıya reklamı izledikten sonra ne yapması gerektiği (Şimdi Satın Al, Üye Ol vb.) açıkça söylenmelidir.</li>
        <li><strong>Kullanıcı Odaklı Olmamak:</strong> Sadece markayı öven reklamlar yerine, kullanıcının yaşadığı bir problemi çözmeye odaklanan reklamlar dönüşüm getirir.</li>
        <li><strong>A/B Testi Yapmamak:</strong> Tek bir görsel veya video ile kampanya yürütmek risklidir. Sürekli farklı formatlar ve kurgular test edilmelidir.</li>
      </ul>

      <blockquote>Reklam kreatiflerinde en büyük hata, markanın kendi beğendiği tasarımı yayınlamasıdır. Önemli olan markanın değil, hedef kitlenin neyi tıkladığıdır.</blockquote>

      <p><strong>Yazar:</strong> Ercan Özdemir, SocialArt Medya Görüntü Yönetmeni. Profesyonel çekim kurguları ve reklam performans analizleri uzmanı.</p>
    `.trim()
  },
  {
    id: 31,
    slug: 'ugc-icerik-hangi-markalarda-daha-iyi-calisir',
    title: 'UGC İçerik Hangi Markalarda Daha İyi Çalışır?',
    excerpt: 'UGC (Kullanıcı Tarafından Üretilen İçerik) özellikle tüketici güvenine ihtiyaç duyan e-ticaret, kozmetik, giyim ve gıda markalarında yüksek dönüşüm sağlar.',
    read_time: '5 dk okuma',
    cover_image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
    content: `
      <h2>UGC İçeriğin En Başarılı Olduğu Sektörler</h2>
      <p>UGC (User Generated Content) içerikler, en çok doğrudan tüketiciye satış yapan (D2C) e-ticaret markalarında, kozmetik, moda, spor ve gıda sektörlerinde yüksek performans ve satış dönüşümü sağlar. Çünkü bu sektörlerdeki alıcılar, kusursuz stüdyo görsellerinden ziyade kendileri gibi gerçek insanların deneyimlerine güvenerek satın alma kararı verirler. SocialArt Medya'nın <a href="/ugc-influencer-isbirligi">UGC ve influencer iş birlikleri</a> departmanı, markaların hedef kitlelerine en uygun doğal içerikleri kurgulamaktadır.</p>

      <h3>UGC İçeriğin Fark Yarattığı Marka Türleri</h3>
      <ul>
        <li><strong>Kozmetik ve Cilt Bakımı:</strong> 'Önce/Sonra' değişimleri ve gerçek insan tenindeki duruşu gösteren UGC'ler güveni %80 artırır.</li>
        <li><strong>Moda ve Hazır Giyim:</strong> Ürünlerin günlük hayatta, doğal ışıkta nasıl durduğunu gösteren giyim deneme (try-on) videoları etkilidir.</li>
        <li><strong>E-Ticaret ve Teknolojik Aletler:</strong> Kutu açılışı (unboxing) ve ürünün fonksiyonlarını gösteren pratik videolar dönüşümü tetikler.</li>
      </ul>

      <h3>UGC ve Klasik Reklam Dönüşüm Karşılaştırması</h3>
      <table border="1" style="width:100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #222; color: #fff;">
            <th style="padding: 10px;">Kriter</th>
            <th style="padding: 10px;">Klasik Reklam Filmi</th>
            <th style="padding: 10px;">UGC (Doğal İçerik)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px;">Güven Düzeyi</td>
            <td style="padding: 10px;">Düşük (Reklam algısı yüksek)</td>
            <td style="padding: 10px;">Yüksek (Samimi ve tarafsız)</td>
          </tr>
          <tr>
            <td style="padding: 10px;">Üretim Maliyeti</td>
            <td style="padding: 10px;">Yüksek (Ekip ve stüdyo gerektirir)</td>
            <td style="padding: 10px;">Ekonomik (Doğal çekimler)</td>
          </tr>
          <tr>
            <td style="padding: 10px;">Tıklama Oranı (CTR)</td>
            <td style="padding: 10px;">Orta</td>
            <td style="padding: 10px;">Geleneksel reklamlara göre %300 daha yüksek</td>
          </tr>
        </tbody>
      </table>

      <blockquote>Tüketiciler markalara değil, insanlara güvenir. Reklamlarınızın gerçek bir kullanıcı önerisi gibi görünmesi satışlarınızı katlar.</blockquote>

      <p><strong>Yazar:</strong> Celal Ünlü, SocialArt Medya Kurucusu & Yönetmen. UGC ve influencer kampanya direktörü.</p>
    `.trim()
  },
  {
    id: 32,
    slug: 'kucuk-isletmeler-meta-reklamlarinda-nereden-baslamali',
    title: 'Küçük İşletmeler Meta Reklamlarında Nereden Başlamalı?',
    excerpt: 'Küçük işletmeler Meta reklamlarına başlarken kısıtlı bütçelerini verimli kullanmak için yerel hedefleme, basit huniler ve dönüşüm odaklı kreatifleri seçmelidir.',
    read_time: '6 dk okuma',
    cover_image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800',
    content: `
      <h2>Küçük İşletmeler İçin Meta Reklamcılığı Rehberi</h2>
      <p>Küçük işletmeler Meta reklamlarına (Facebook & Instagram Ads) başlarken bütçelerini korumak amacıyla yerel konum hedeflemesi yapmalı, net bir değer teklifi sunan basit dönüşüm kampanyaları kurmalı ve yüksek kaliteli Reels videoları kullanmalıdır. Geniş ve karmaşık kurgularla başlamak bütçeyi hızla tüketebilir; bu nedenle ilk aşamada en karlı niş kitleye odaklanılmalıdır. SocialArt Medya olarak küçük ve orta ölçekli işletmelerin büyüme yolculuklarına <a href="/meta-ads-yonetimi">Meta reklam yönetimi</a> hizmetimizle destek veriyoruz.</p>

      <h3>Yeni Başlayan Küçük İşletmeler İçin Yol Haritası</h3>
      <ul>
        <li><strong>Bütçeyi Doğru Belirleyin:</strong> Günlük çok yüksek bütçeler yerine, minimum 300 - 500 TL gibi test bütçeleriyle algoritmanın veri toplamasını sağlayın.</li>
        <li><strong>Konum Bazlı Hedefleme Yapın:</strong> Fiziksel bir işletmeyseniz, yalnızca restoran veya mağazanızın 5-10 km çevresindeki kişileri hedefleyin.</li>
        <li><strong>Dönüşüm Kampanyalarını Seçin:</strong> Beğeni veya takipçi odaklı kampanyalar yerine, doğrudan web sitesi satışı veya WhatsApp/DM mesajı getiren dönüşüm odaklı kampanyalar açın.</li>
      </ul>

      <h3>Küçük İşletmeler İçin Adım Adım Bütçe Verimliliği</h3>
      <table border="1" style="width:100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #222; color: #fff;">
            <th style="padding: 10px;">Adım</th>
            <th style="padding: 10px;">Odak Alanı</th>
            <th style="padding: 10px;">Amaç</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px;">1. Adım</td>
            <td style="padding: 10px;">Yerel Hedefleme</td>
            <td style="padding: 10px;">Bütçe israfını önleme</td>
          </tr>
          <tr>
            <td style="padding: 10px;">2. Adım</td>
            <td style="padding: 10px;">Teklif Odaklı Kreatif</td>
            <td style="padding: 10px;">Müşteriyi hızlıca ikna etme</td>
          </tr>
          <tr>
            <td style="padding: 10px;">3. Adım</td>
            <td style="padding: 10px;">WhatsApp/DM Yönlendirme</td>
            <td style="padding: 10px;">Hızlı satış kapatma</td>
          </tr>
        </tbody>
      </table>

      <blockquote>Küçük bütçeyle Meta reklamlarında başarılı olmanın sırrı, doğrudan en sıcak alıcı adayına odaklanmak ve onlara karşı koyamayacakları bir teklif sunmaktır.</blockquote>

      <p><strong>Yazar:</strong> Celal Ünlü, SocialArt Medya Kurucusu. Küçük ve orta ölçekli işletmeler için dijital büyüme danışmanıdır.</p>
    `.trim()
  },
  {
    id: 33,
    slug: 'sosyal-medya-ajansi-secerken-nelere-dikkat-edilmeli',
    title: 'Sosyal Medya Ajansı Seçerken Nelere Dikkat Edilmeli?',
    excerpt: 'Doğru sosyal medya ajansı seçmek markanızın dijital geleceğini belirler. Sadece tasarıma değil; stratejiye, referanslara ve entegre performans yaklaşımına bakın.',
    read_time: '5 dk okuma',
    cover_image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800',
    content: `
      <h2>Doğru Sosyal Medya Ajansı Nasıl Seçilir?</h2>
      <p>Sosyal medya ajansı seçerken sadece ajansın hazırladığı estetik tasarımlara değil; markanın iş hedeflerine katkısına, veri odaklı stratejisine, referans vaka çalışmalarına ve reklam yönetimi entegrasyonuna dikkat edilmelidir. Sadece 'paylaşım yapan' bir ajans yerine, markanızın cirosunu büyütecek bir iş ortağı seçmek yatırım getirinizi (ROI) yükseltir. SocialArt Medya, İstanbul merkezli olarak markalara bütünsel <a href="/sosyal-medya-yonetimi">sosyal medya yönetimi</a> ve büyüme danışmanlığı sunmaktadır.</p>

      <h3>Ajans Seçiminde Sormanız Gereken 4 Kritik Soru</h3>
      <ul>
        <li><strong>Sadece içerik mi paylaşıyorlar, yoksa büyüme stratejisi kuruyorlar mı?</strong> Sosyal medya yönetimi reklam yönetimi ve kreatif prodüksiyon ile bütünleşik yürütülmelidir.</li>
        <li><strong>Daha önceki çalışmaları ve başarı hikayeleri (Case Study) nelerdir?</strong> Sizinle benzer sektördeki markalarda aldıkları sonuçları inceleyin.</li>
        <li><strong>Raporlamalarında hangi metrikler yer alıyor?</strong> Beğeni sayılarının ötesinde, profil trafiği, web sitesi yönlendirmeleri ve satış dönüşümlerini raporlamalıdırlar.</li>
        <li><strong>Kreatif prodüksiyon güçleri var mı?</strong> Ajansın kendi stüdyosunun veya video ekibinin olması içerik kalitesini ve hızını doğrudan artırır.</li>
      </ul>

      <blockquote>Sosyal medya ajansınız bir gider kalemi değil, sizin için çalışan bir gelir kanalı olmalıdır. Seçiminizi bu vizyona göre yapın.</blockquote>

      <p><strong>Yazar:</strong> Celal Ünlü, SocialArt Medya Kurucusu & Yönetmen. Dijital ajans yapılanması ve marka yönetimi mentoru.</p>
    `.trim()
  },
  {
    id: 34,
    slug: 'e-ticaret-markalari-icin-reklam-kreatifi-nasil-hazirlanmali',
    title: 'E-Ticaret Markaları İçin Reklam Kreatifi Nasıl Hazırlanmalı?',
    excerpt: 'E-ticaret siteleri için reklam kreatifi hazırlarken ilk 3 saniyede dikkat çeken kancalar, ürünün faydaları ve sosyal kanıtlar kullanılmalıdır.',
    read_time: '5 dk okuma',
    cover_image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800',
    content: `
      <h2>E-Ticaret Reklam Kreatifi Hazırlama Kılavuzu</h2>
      <p>E-ticaret markaları için reklam kreatifi hazırlarken; ilk 3 saniyede kullanıcının kaydırmasını durduracak bir kanca (hook) kullanılmalı, ürünün sunduğu çözüm net şekilde gösterilmeli ve müşteri yorumları gibi sosyal kanıtlarla güven inşa edilmelidir. SocialArt Medya olarak yürüttüğümüz <a href="/dijital-pazarlama-danismanligi">dijital pazarlama danışmanlığı</a> ve kreatif süreçlerimizde, e-ticaret sitelerinin dönüşüm oranlarını artırmak için bilimsel kreatif testler uyguluyoruz.</p>

      <h3>E-Ticaret Performans Kreatiflerinin Olmazsa Olmazları</h3>
      <ul>
        <li><strong>Kanca (Hook) Çeşitliliği:</strong> Videonun ilk 3 saniyesinde 'Bu ürünü neden almalısınız?' sorusunu cevaplayın. Farklı kancalar test edin.</li>
        <li><strong>Problem ve Çözüm Dengesi:</strong> Ürünü sadece göstermeyin, çözdüğü problemi ve hayatı nasıl kolaylaştırdığını görselleştirin.</li>
        <li><strong>Sosyal Kanıt (Social Proof):</strong> Videoların veya görsellerin içerisine yıldızlı müşteri yorumları ve memnuniyet ifadeleri yerleştirin.</li>
        <li><strong>Teklif ve CTA:</strong> Kampanyayı (Örn: Sepette %20 İndirim) ve nereye tıklanacağını (Şimdi Al) çok belirgin yapın.</li>
      </ul>

      <h3>Performans Getiren E-Ticaret Kreatif Formatları</h3>
      <table border="1" style="width:100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #222; color: #fff;">
            <th style="padding: 10px;">Format</th>
            <th style="padding: 10px;">Kullanım Amacı</th>
            <th style="padding: 10px;">Dönüşüm Gücü</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px;">UGC Deneyim Videosu</td>
            <td style="padding: 10px;">Güven ve ürünün kullanımını gösterme</td>
            <td style="padding: 10px;">Çok Yüksek (En yüksek dönüşüm)</td>
          </tr>
          <tr>
            <td style="padding: 10px;">Karşılaştırma (Vs) Videosu</td>
            <td style="padding: 10px;">Rakiplerle farkları anlatma</td>
            <td style="padding: 10px;">Yüksek (Kararsız alıcıları ikna eder)</td>
          </tr>
          <tr>
            <td style="padding: 10px;">Kutu Açılışı (Unboxing)</td>
            <td style="padding: 10px;">Paket kalitesi ve kargo deneyimini gösterme</td>
            <td style="padding: 10px;">Orta-Yüksek (İlk alıcıları ısıtır)</td>
          </tr>
        </tbody>
      </table>

      <blockquote>E-ticaret reklam kreatiflerinde amaç estetik ödüller almak değil, sepeti doldurmaktır. Sade, anlaşılır ve fayda odaklı kreatifler her zaman kazandırır.</blockquote>

      <p><strong>Yazar:</strong> Celal Ünlü, SocialArt Medya Kurucusu. E-ticaret büyüme ve performans pazarlaması uzmanıdır.</p>
    `.trim()
  }
];

async function seed() {
  console.log('Inserting new GEO blogs...');
  for (const blog of newBlogs) {
    const { data, error } = await sb.from('blogs').upsert([blog]).select();
    if (error) {
      console.error(`Error inserting ${blog.slug}:`, JSON.stringify(error, null, 2));
    } else {
      console.log(`✅ Success: ${blog.slug} (ID: ${data[0].id})`);
    }
  }
  console.log('Seeding finished!');
}

seed();
