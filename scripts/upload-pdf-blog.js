import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { createClient } from '@supabase/supabase-js';

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

const pdfPath = "C:\\Users\\Arda Furkan Aslanbaş\\Downloads\\Kısa Video İçerikleri Neden Markalar İçin Vazgeçilmez Hale Geldi.pdf";

async function run() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    
    let text = data.text;
    
    // Temel temizlik (Fazla boşluklar, satır sonları vs.)
    text = text.replace(/\n\n+/g, '\n\n').trim();
    
    // Blog verileri
    const title = "Kısa Video İçerikleri Neden Markalar İçin Vazgeçilmez Hale Geldi?";
    const slug = "kisa-video-icerikleri-markalar-icin-neden-vazgecilmez";
    const coverImage = "/short_video_marketing.jpg";
    const excerpt = "Günümüz dijital pazarlama dünyasında kısa video içeriklerinin markalar üzerindeki etkisi ve neden stratejilerde yer alması gerektiği üzerine detaylı bir analiz.";
    const readTime = "5 dk okuma";
    
    const { data: maxIdData, error: maxIdError } = await supabase
      .from('blogs')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    let newId = 1;
    if (maxIdData && maxIdData.length > 0) {
      newId = maxIdData[0].id + 1;
    }

    const blogData = {
      id: newId,
      title,
      slug,
      content: text,
      excerpt,
      read_time: readTime,
      cover_image: coverImage
    };

    const { error } = await supabase.from('blogs').insert([blogData]);
    if (error) {
      console.error("Veritabanına eklenirken hata oluştu:", error);
    } else {
      console.log("Blog başarıyla eklendi!");
    }
    
  } catch (err) {
    console.error("PDF okuma veya işleme hatası:", err);
  }
}

run();
