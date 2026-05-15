const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Environment variables (to be set in GitHub Actions Secrets)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

console.log("Supabase client initialized (Static mode)...");

const TOPICS = [
  "Meta Ads Optimizasyonu: 2026'da Reklam Bütçenizi Nasıl Korursunuz?",
  "GEO (Generative Engine Optimization): Yapay Zeka Aramalarında Üst Sıralara Çıkmanın Yolları",
  "Kreatif Prodüksiyon: Sosyal Medyada Neden Sinematik İçeriklere İhtiyacınız Var?",
  "AI ve Pazarlama: İşletmenizi Büyütmek İçin Yapay Zekayı Nasıl Kullanmalısınız?",
  "UGC (Kullanıcı Tarafından Oluşturulan İçerik): Tüketicinin Güvenini Kazanmanın En Hızlı Yolu",
  "Influencer Pazarlaması mı Yoksa Performans Reklamcılığı mı? Hangisi Daha Verimli?",
  "Görsel Hikayecilik: Sadece Kaydırmak Değil, İz Bırakmak İçin Stratejiler",
  "ROAS Artırma Yöntemleri: Reklam Geri Dönüşlerinizi Nasıl İkiye Katlarsınız?",
  "Dikey Video Çağı: Reels ve TikTok ile Marka Bilinirliği Yaratma",
  "Yerel SEO'dan GEO'ya Geçiş: Haritalarda ve AI Yanıtlarında Görünür Olun"
];

async function generateBlogPost() {
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  
  console.log(`Generating content for: ${topic}...`);
  
  const prompt = `
    Sen SocialArt isminde, premium bir dijital büyüme ve kreatif ajansın içerik yazarısın.
    Konu: ${topic}
    İstekler:
    - Dil: Profesyonel, vizyoner, büyüme odaklı ve samimi bir Türkçe.
    - Başlık (title): SEO uyumlu, dikkat çekici.
    - Özet (excerpt): Okuyucuyu içeriğe çekecek, 2-3 cümlelik merak uyandırıcı bir giriş.
    - İçerik (content): En az 300 kelime, alt başlıklar (h2), listeler (ul/li) ve güçlü paragraflar içeren HTML formatında yazı.
    - Anahtar Kelimeler: SocialArt, büyüme, ajans, pazarlama, SEO, GEO.
    - Önemli: Mutlaka bir JSON objesi döndür. Anahtarlar: "title", "excerpt", "content".
  `;

  try {
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    if (!response.data || !response.data.candidates) {
      console.error("Full AI Response Error:", JSON.stringify(response.data));
      throw new Error("AI response format invalid");
    }

    const resultText = response.data.candidates[0].content.parts[0].text;
    console.log("Raw AI Response:", resultText);

    // Extract JSON from markdown code block if present
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to find JSON in AI response:", resultText);
      throw new Error("Could not parse JSON from AI response");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    if (error.response) {
      console.error("AI API Error Details:", JSON.stringify(error.response.data));
    } else {
      console.error("AI Generation Error:", error.message);
    }
    throw error;
  }
}

async function run() {
  try {
    const blogData = await generateBlogPost();
    
    // Generate slug
    const slug = blogData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Pick a random image from Unsplash related to the topic
    const keywords = ["digital-marketing", "minimalist-office", "artificial-intelligence", "studio-lighting", "camera-lens", "modern-architecture"];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    // Using Unsplash source with specific dimensions and a random seed for uniqueness
    const unsplashUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?q=80&w=1600&auto=format&fit=crop&sig=${Date.now()}&keyword=${randomKeyword}`;
    
    // Fallback using a reliable random source
    const cover_image = `https://source.unsplash.com/1600x900/?${randomKeyword},professional`;

    const newPost = {
      title: blogData.title,
      excerpt: blogData.excerpt,
      content: blogData.content,
      slug: `${slug}-${Date.now()}`,
      cover_image: unsplashUrl,
      read_time: "5 dk okuma",
      created_at: new Date().toISOString()
    };

    console.log("Saving to Supabase...");
    const { data, error } = await supabase
      .from('blogs')
      .insert([newPost]);

    if (error) throw error;
    
    console.log(`Successfully published: ${blogData.title}`);
  } catch (error) {
    console.error("Automation Script Failed:", error);
    process.exit(1);
  }
}

run();
