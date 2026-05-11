import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function uploadVideos() {
  const files = [
    { name: 'video1.mov', local: 'public/assets/videos/video1.mov' },
    { name: 'video2.mp4', local: 'public/assets/videos/video2.mp4' },
    { name: 'video3.mp4', local: 'public/assets/videos/video3.mp4' }
  ];

  for (const file of files) {
    console.log(`Uploading ${file.name}...`);
    const fileData = fs.readFileSync(file.local);
    const { data, error } = await supabase.storage
      .from('site-assets')
      .upload(`videos/${file.name}`, fileData, {
        upsert: true,
        contentType: file.name.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'
      });

    if (error) {
      console.error(`Error uploading ${file.name}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file.name}`);
    }
  }
}

uploadVideos();
