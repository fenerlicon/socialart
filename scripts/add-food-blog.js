import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
const envFile = fs.readFileSync(envPath, 'utf8');

const envConfig = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envConfig[match[1]] = match[2].trim();
  }
});

const supabaseUrl = envConfig['VITE_SUPABASE_URL'];
const supabaseKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function addBlog() {
  const blog = {
    slug: 'restoranlar-icin-yemek-siparisi-artirma-teknikleri',
    title: 'Restoranlar İçin Yemek Siparişi Arttırma Teknikleri (SEO ve GEO ile Kesin Çözümler)',
    excerpt: 'Dijital dünyada restoranınızın siparişlerini artırmak için geleneksel yöntemler yeterli değil. SEO ve yeni nesil GEO (Generative Engine Optimization) teknikleriyle rakiplerinizi geride bırakın ve paket siparişlerinizi katlayın.',
    content: `
      <h2>Paket Siparişlerinizi Katlayacak Dijital Stratejiler</h2>
      <p>Günümüzde yemek siparişi veren müşterilerin büyük bir kısmı tercihlerini Google aramaları, Yemeksepeti/Getir gibi platformlar ve yapay zeka asistanları üzerinden yapıyor. Eğer restoranınız bu kanallarda öne çıkmıyorsa, potansiyel müşterilerinizi rakiplerinize kaptırıyorsunuz demektir. Peki, <strong>yemek siparişi arttırma teknikleri</strong> nelerdir ve modern SEO/GEO yaklaşımları bu sürece nasıl katkı sağlar?</p>

      <h2>1. Google My Business (Google Haritalar) Optimizasyonu</h2>
      <p>Bir müşteri "yakınımdaki hamburgerciler" araması yaptığında ilk karşısına çıkan yer, Google Haritalar sonuçlarıdır (Local SEO). Bu alanda üst sıralarda yer almak için:</p>
      <ul>
        <li>İşletme profilinizi tam ve eksiksiz doldurun.</li>
        <li>Menünüzü yüksek kaliteli görsellerle birlikte Google profilinize ekleyin.</li>
        <li>Müşteri yorumlarına mutlaka anında ve kurumsal bir dille yanıt verin.</li>
        <li>"Paket servis", "temassız teslimat" gibi özellikleri aktif edin.</li>
      </ul>

      <h2>2. Yemek Siparişi Aramalarında GEO (Yapay Zeka) Uyumu</h2>
      <p>Sıradan SEO'nun yerini artık GEO (Generative Engine Optimization) alıyor. ChatGPT veya Google'ın SGE (Yapay Zeka Araması) özelliklerine uyumlu olmak, siparişlerinizi dramatik ölçüde artırabilir.</p>
      <ul>
        <li><strong>Semantik Kelimeler:</strong> Sadece "pizza siparişi" değil, "gece açık en iyi ince hamur pizza İstanbul" gibi uzun kuyruklu ve niş kelimelere odaklanın. Yapay zeka bu spesifik verileri sever.</li>
        <li><strong>Menü Schema Markup:</strong> Web sitenizin altyapısına <code>Restaurant</code> ve <code>Menu</code> Schema kodlarını (yapılandırılmış veri) ekleyin. Böylece AI botları restoranınızın ne sattığını, fiyatlarını ve saatlerini direkt anlar ve kullanıcılara önerir.</li>
        <li>Sıkça sorulan sorulara (Örn: "Glutensiz seçeneğiniz var mı?") sitenizde mutlaka yer verin.</li>
      </ul>

      <h2>3. Sosyal Medya (Instagram ve TikTok) Satış Hunileri</h2>
      <p>Sosyal medya sadece iştah açıcı videolar paylaşmak için değildir; doğrudan siparişe yönlendiren bir hunidir.</p>
      <p><strong>Uygulanabilir Teknik:</strong> Reels videolarınızın sonuna her zaman net bir CTA (Call to Action) ekleyin. Örneğin: <i>"Hemen profildeki linke tıkla, 30 dakikada kapında sıcak sıcak olsun!"</i> Ayrıca Meta (Facebook/Instagram) üzerinden bölgesel reklamlar çıkarak, restoranınızın 5 kilometre çapındaki insanlara öğle yemeği ve akşam yemeği saatlerinde "Acıktınız mı?" konseptli sponsorlu gönderiler gösterin.</p>

      <h2>4. Kendi Sipariş Altyapınızı Kurun</h2>
      <p>Pazaryerlerinin (Yemeksepeti, Trendyol Yemek vb.) kestiği yüksek komisyon oranlarından kurtulmak ve <strong>siparişleri kendi üzerinize çekmek</strong> karlılığınızı artırır.</p>
      <p>SEO uyumlu, hızlı açılan ve mobil uyumlu bir "Online Sipariş" web siteniz olsun. Müşterilerinize ilk siparişe özel %15 indirim gibi kampanyalar sunarak onları doğrudan sizin sitenizden sipariş vermeye alıştırın. Sitenizin hız performansı SEO puanını artırır ve Google sizi üst sıralara taşır.</p>

      <h2>5. UGC (Kullanıcı Tarafından Üretilen İçerik) ile Güven İnşası</h2>
      <p>İnsanlar başka insanların yediği ve beğendiği şeyleri sipariş etmeye çok daha yatkındır. Restoranınıza gelen fenomenleri (Influencer) ve yerel foodie'leri ağırlayarak mekanınızda çekilmiş "Doğal" içerikler üretmelerini sağlayın.</p>
      
      <h2>Sonuç: Dijital Varlığınızı Güçlendirin</h2>
      <p>Yemek siparişlerinizi istikrarlı bir şekilde artırmak; iyi bir mutfak kadar kusursuz bir dijital pazarlama stratejisi gerektirir. Yerel SEO (Local SEO), GEO uyumlu web sitesi ve veri odaklı sosyal medya yönetimi ile bölgenizin vazgeçilmez restoranı olabilirsiniz.</p>
      <p><strong>SocialArt Ajans</strong> olarak, gastronomi markalarına özel uçtan uca dijital büyüme sistemleri kuruyoruz. Restoranınızın reklam ve büyüme süreçlerini profesyonellere bırakmak isterseniz, ekibimizle hemen bir toplantı planlayabilirsiniz.</p>
    `,
    read_time: '4 dk okuma',
    cover_image: '/blog_cover_food_order_geo.png'
  };

  const { data: maxData, error: maxError } = await supabase
    .from('blogs')
    .select('id')
    .order('id', { ascending: false })
    .limit(1);

  let newId = 1;
  if (!maxError && maxData && maxData.length > 0) {
    newId = maxData[0].id + 1;
  }
  
  blog.id = newId;

  const { data, error } = await supabase.from('blogs').insert([blog]);
  if (error) {
    console.error('Error inserting blog:', error);
  } else {
    console.log('Successfully inserted blog!');
  }
}

addBlog();
