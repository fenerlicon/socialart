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

function extractTags(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\\/${tag}>`, 'gs');
  let matches = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1].trim().replace(/<!\\[CDATA\\[(.*?)\\]\\]>/gs, '$1'));
  }
  return matches;
}

function extractEnclosureUrl(itemXml) {
  const match = itemXml.match(/<enclosure[^>]+url="([^"]+)"/i);
  return match ? match[1] : 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800';
}

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\\s-]/g, '')
    .trim()
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-');
}

async function scrapeAndMigrate() {
  const client = new Client({ connectionString });
  
  try {
    console.log('RSS Haritasi indiriliyor...');
    const response = await fetch('https://www.socialartajans.com/blog-feed.xml');
    const xml = await response.text();
    
    // Split into items
    const itemChunks = xml.split('<item>');
    itemChunks.shift(); // remove channel header
    
    const blogs = itemChunks.map(chunk => {
      const title = extractTags(chunk, 'title')[0] || 'Basliksiz';
      const link = extractTags(chunk, 'link')[0];
      const description = extractTags(chunk, 'description')[0] || '';
      const pubDate = extractTags(chunk, 'pubDate')[0];
      const coverImage = extractEnclosureUrl(chunk);
      
      return {
        title,
        slug: createSlug(title),
        excerpt: description.substring(0, 150) + '...',
        content: `
          <p>${description}</p>
          <p><em>(Bu makale eski siteden otomatik olarak aktarılmıştır. Orijinal yazının detaylı içeriği güncellenecektir.)</em></p>
        `,
        read_time: '3 dk okuma',
        cover_image: coverImage,
        created_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
      };
    });

    console.log(`Toplam ${blogs.length} makale bulundu! Veritabanina aktariliyor...`);

    await client.connect();
    
    for (const blog of blogs) {
      try {
        await client.query(`
          INSERT INTO blogs (slug, title, excerpt, content, read_time, cover_image, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (slug) DO UPDATE 
          SET title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, cover_image = EXCLUDED.cover_image
        `, [blog.slug, blog.title, blog.excerpt, blog.content, blog.read_time, blog.cover_image, blog.created_at]);
      } catch(e) {
        console.error('Hata (Blog atlandi):', blog.title);
      }
    }
    
    console.log('Tum bloglar eklendi!');
  } catch (err) {
    console.error('Islem Sirasinda Hata:', err);
  } finally {
    await client.end();
  }
}

scrapeAndMigrate();
