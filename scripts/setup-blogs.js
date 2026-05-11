import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const connectionString = `postgresql://postgres:${dbPassword}@db.zpulnweiosxphibipxdp.supabase.co:5432/postgres`;

const blogs = [
  {
    slug: 'neden-urununuzu-sunucu-cekimi-ile-anlatmalisiniz',
    title: 'Neden Ürününüzü Sunucu Çekimi ile Anlatmalısınız?',
    excerpt: 'Dijital dünyada kullanıcıların dikkat süresi her geçen gün azalıyor. Özellikle sosyal medya reklamları ve web sitelerinde sadece ürün göstermek yeterli olmuyor...',
    read_time: '2 dk okuma',
    cover_image: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&q=80&w=800',
    content: `
      <h2>Sunucu Çekimi Nedir?</h2>
      <p>Sunucu çekimi; bir kişinin kamera karşısında ürünü deneyimlediği, anlattığı veya kullanıcıya doğrudan hitap ettiği profesyonel video içerikleridir. Bu içerikler reklam filmlerinde, sosyal medya videolarında, e-ticaret ürün tanıtımlarında ve kurumsal marka iletişiminde sıklıkla tercih edilir.</p>
      
      <h2>Ürün Tanıtımında Güven Unsuru Oluşturur</h2>
      <p>Bir kullanıcı satın alma kararı verirken ilk olarak güven duymak ister. Ürünü sadece görsel olarak göstermek yerine, bir sunucunun ürünü anlatması markaya insan dokunuşu kazandırır. Kamera karşısında doğru diksiyonla yapılan bir anlatım, markayı daha profesyonel gösterir, ürünün kullanım alanını net aktarır ve satın alma kararını hızlandırır.</p>
      
      <h2>Reklam Performansını Güçlendirir</h2>
      <p>Meta ve Google reklamlarında video içerikler artık statik görsellere göre çok daha yüksek performans gösteriyor. Ancak burada önemli olan yalnızca video kullanmak değil, dikkat çekici bir anlatım dili oluşturmaktır. Sunucu çekimleri sayesinde ilk 3 saniyede dikkat çekilebilir ve ürünün faydası hızlıca anlatılabilir.</p>
      
      <h2>Sosyal Medyada Daha Fazla Etkileşim Sağlar</h2>
      <p>Algoritmalar insan yüzü bulunan içerikleri daha fazla öne çıkarma eğilimindedir. İnsanlar insanları izlemeyi sever. Doğru kurgu ve doğru sunucu ile hazırlanan içerikler kaydetme oranını artırır ve organik erişime katkı sağlar.</p>
    `
  },
  {
    slug: 'restoraninizi-sosyal-medya-reklam-ve-produksiyon-ile-buyutun',
    title: 'Restoranınızı Sosyal Medya, Reklam ve Prodüksiyon ile Büyütün!',
    excerpt: 'Günümüzde restoranların başarısı yalnızca lezzetle ölçülmüyor. Müşteriler, bir mekâna gitmeden önce dijitaldeki yansımasını inceliyor...',
    read_time: '3 dk okuma',
    cover_image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
    content: `
      <h2>Lezzet Kadar Görsellik de Önemli</h2>
      <p>Günümüzde restoranların başarısı yalnızca lezzetle ölçülmüyor. Müşteriler, bir mekâna gitmeden önce Instagram hesaplarını inceliyor, yorumları okuyor ve mekânın atmosferini dijital ortamdan değerlendiriyor.</p>
      <p>İşte bu noktada restoran sosyal medya yönetimi, sosyal medya reklam ve prodüksiyon hizmeti, markaların öne çıkması için kritik bir rol oynuyor. Doğru strateji ve profesyonel içerik ile sosyal medya, restoranların müşteri kazanma, marka bilinirliği artırma ve satışları yükseltme kanalı haline geliyor.</p>
      
      <h2>Profesyonel Fotoğraf ve Video Prodüksiyonu</h2>
      <p>Yemek, göze de hitap eden bir deneyimdir. Menünüzde harika yemekler olabilir, ancak bu yemekler dijital dünyada iyi sunulmuyorsa potansiyel müşterilerin dikkatini çekmesi zordur. Profesyonel prodüksiyon ekibi ile gerçekleştirilen fotoğraf ve video çekimleri, yemeklerinizi adeta iştah açıcı bir sanat eserine dönüştürür.</p>
      
      <h2>Etkileşim Odaklı Sosyal Medya Yönetimi</h2>
      <p>Sadece fotoğraf paylaşmak yeterli değildir. Sosyal medya platformlarında varlık göstermek, aynı zamanda müşterilerle bir diyalog kurmayı gerektirir. Hikayeler (Stories), Reels videoları ve etkileşimli gönderiler sayesinde restoranınız, kitlesiyle sürekli iletişim halinde kalır.</p>
    `
  },
  {
    slug: 'markalar-neden-ugc-ureticileri-ile-calismali',
    title: 'Markalar Neden UGC Üreticileri ile Çalışmalı?',
    excerpt: 'Dijital pazarlamada tüketici davranışları köklü şekilde değişti. Kullanıcılar artık klasik reklamlardan çok gerçek insanların deneyimlerine güveniyor...',
    read_time: '4 dk okuma',
    cover_image: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&q=80&w=800',
    content: `
      <h2>UGC (User Generated Content) Nedir?</h2>
      <p>Dijital pazarlamada tüketici davranışları son yıllarda köklü şekilde değişti. Kullanıcılar artık klasik reklamlardan çok gerçek insanların deneyimlerine güveniyor. Bu değişimle birlikte UGC (Kullanıcı Tarafından Üretilen İçerik), markalar için en etkili büyüme araçlarından biri haline geldi.</p>
      
      <h2>Samimiyet ve Güven İnşası</h2>
      <p>Geleneksel stüdyo çekimleri ne kadar profesyonel olursa olsun, tüketicinin gözünde "bu bir reklam" algısı yaratır. Oysa UGC içerikleri amatör bir ruh taşıdığı için doğrudan "tavsiye" olarak algılanır. Bir ürünün gerçek bir evin salonunda veya mutfağında nasıl göründüğünü izlemek, tüketici güvenini katlayarak artırır.</p>
      
      <h2>Daha Düşük Maliyet, Daha Yüksek Etki</h2>
      <p>Geleneksel bir reklam filmi çekmek mekan kirası, profesyonel ekipmanlar, oyuncu kaşeleri gibi ciddi bütçeler gerektirirken; UGC üreticileriyle çalışmak çok daha maliyet etkindir. Üstelik bu içeriklerin dijital reklamlardaki (Meta Ads, Google vb.) tıklanma ve dönüşüm maliyetleri (CPA), standart reklamlara kıyasla %50'ye varan oranlarda daha düşüktür.</p>
    `
  },
  {
    slug: 'sosyal-medya-yonetiminde-stratejik-faktorler',
    title: 'Sosyal Medya Yönetiminde Stratejik Faktörler',
    excerpt: 'Dijital dünyada görünür olmak artık tek başına yeterli değil. Markalar için asıl fark yaratan unsur, stratejik ve planlı bir sosyal medya yönetimidir...',
    read_time: '3 dk okuma',
    cover_image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800',
    content: `
      <h2>Stratejisiz Paylaşımlar Zaman Kaybıdır</h2>
      <p>Dijital dünyada görünür olmak artık tek başına yeterli değil. Markalar için asıl fark yaratan unsur, stratejik sosyal medya yönetimidir. Plansız paylaşımlar kısa vadede etkileşim getirebilir; ancak uzun vadede marka algısı, güven ve satışa dönüşen sonuçlar ancak doğru bir stratejiyle mümkün olur.</p>
      
      <h2>1. Net ve Ölçülebilir Hedefler Belirlemek</h2>
      <p>Sosyal medya yönetimine başlamadan önce hedefler net yanıtlanmalıdır: Marka bilinirliği mi artırılacak? Potansiyel müşteri mi toplanacak? Satış mı hedefleniyor? Hedefi belli olmayan bir gemiye hiçbir rüzgar yardım edemez.</p>
      
      <h2>2. Hedef Kitle Analizi ve Doğru Platform Seçimi</h2>
      <p>Her içerik herkes için değildir. Genç ve dinamik bir kitleye ulaşmak istiyorsanız Instagram ve YouTube Shorts üzerinde durmalısınız. Eğer B2B (şirketten şirkete) bir hizmet satıyorsanız odak noktanız LinkedIn olmalıdır. Doğru platform seçimi reklam bütçenizin boşa gitmesini engeller.</p>
      
      <h2>3. Veri Analizi ve Sürekli Optimizasyon</h2>
      <p>Sosyal medya durağan değil, dinamiktir. Her ay sonu veriler incelenmeli; "Hangi içerik daha çok kaydedildi?", "Hangi reklam seti daha ucuz maliyet getirdi?" gibi soruların cevaplarıyla bir sonraki ayın stratejisi güncellenmelidir.</p>
    `
  }
];

async function setupDatabase() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Veritabanina baglanildi...');

    // Tabloyu oluştur
    await client.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        read_time TEXT,
        cover_image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('blogs tablosu hazir.');

    // Tabloyu temizle (Eğer daha önce test eklendiyse)
    await client.query('TRUNCATE TABLE blogs RESTART IDENTITY');

    // Blogları ekle
    for (const blog of blogs) {
      await client.query(`
        INSERT INTO blogs (slug, title, excerpt, content, read_time, cover_image)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [blog.slug, blog.title, blog.excerpt, blog.content, blog.read_time, blog.cover_image]);
    }
    
    console.log('Tüm bloglar başariyla Supabase veritabanina aktarildi!');
  } catch (err) {
    console.error('Veritabani Hatasi:', err);
  } finally {
    await client.end();
  }
}

setupDatabase();
