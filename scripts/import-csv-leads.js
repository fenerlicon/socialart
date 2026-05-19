import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function extractLeadsFromCSV(filePath, sourceName) {
  const text = fs.readFileSync(filePath, 'utf-8');
  const lines = text.split('\n');
  const headers = parseCSVLine(lines[0]);
  
  const emailIdx = headers.indexOf('email');
  const titleIdx = headers.indexOf('title');
  
  if (emailIdx === -1 || titleIdx === -1) {
    console.error(`Error: email or title column not found in ${filePath}`);
    return [];
  }
  
  const leads = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const columns = parseCSVLine(line);
    
    let emailStr = columns[emailIdx] || '';
    // Temizle
    emailStr = emailStr.replace(/^"+|"+$/g, '').trim();
    
    let nameStr = columns[titleIdx] || '';
    nameStr = nameStr.replace(/^"+|"+$/g, '').trim();
    
    if (emailStr && emailStr.includes('@')) {
      // Bazen birden fazla e-mail virgülle ayrılmış olabilir
      const emails = emailStr.split(',').map(e => e.trim()).filter(Boolean);
      for (const email of emails) {
        if (email.includes('@')) {
          leads.push({
            email: email.toLowerCase(),
            name: nameStr,
            source: sourceName,
            status: 'active'
          });
        }
      }
    }
  }
  return leads;
}

async function run() {
  try {
    // 1. Mevcut e-postaları çek
    console.log("Fetching existing emails from database...");
    const { data: existingLeads, error: fetchError } = await supabase
      .from('email_marketing_leads')
      .select('email');
      
    if (fetchError) throw fetchError;
    
    const existingEmailsSet = new Set(existingLeads.map(l => l.email.toLowerCase().trim()));
    console.log(`Found ${existingEmailsSet.size} existing emails in marketing pool.`);
    
    // 2. CSV'leri oku
    const path6 = "C:\\Users\\Arda Furkan Aslanbaş\\Downloads\\result (6).csv";
    const path7 = "C:\\Users\\Arda Furkan Aslanbaş\\Downloads\\result (7).csv";
    
    const leads6 = extractLeadsFromCSV(path6, "result (6).csv");
    const leads7 = extractLeadsFromCSV(path7, "result (7).csv");
    
    console.log(`Parsed ${leads6.length} leads from result (6).csv`);
    console.log(`Parsed ${leads7.length} leads from result (7).csv`);
    
    // 3. Olmayanları ayıkla
    const allLeads = [...leads6, ...leads7];
    const newLeads = [];
    const seenInBatch = new Set();
    
    for (const lead of allLeads) {
      if (!existingEmailsSet.has(lead.email) && !seenInBatch.has(lead.email)) {
        newLeads.push(lead);
        seenInBatch.add(lead.email);
      }
    }
    
    console.log(`Found ${newLeads.length} unique new leads to insert.`);
    
    if (newLeads.length === 0) {
      console.log("No new leads to insert.");
      return;
    }
    
    // 4. Veritabanına ekle (chunklar halinde eklemek daha güvenlidir)
    const chunkSize = 100;
    for (let i = 0; i < newLeads.length; i += chunkSize) {
      const chunk = newLeads.slice(i, i + chunkSize);
      const { error: insertError } = await supabase
        .from('email_marketing_leads')
        .insert(chunk);
        
      if (insertError) {
        console.error(`Error inserting chunk ${i / chunkSize}:`, insertError);
      } else {
        console.log(`Inserted chunk ${i / chunkSize + 1} / ${Math.ceil(newLeads.length / chunkSize)}`);
      }
    }
    
    console.log("Import process completed!");
    
  } catch (err) {
    console.error("An error occurred during import:", err);
  }
}

run();
