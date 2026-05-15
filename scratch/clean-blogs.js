import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const coverImages = [
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // Digital marketing dashboard
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // Data analysis
  'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // Tech team working
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80', // Strategy planning
  'https://images.unsplash.com/photo-1533750516457-a7f992034fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'  // Creative studio
];

function stripCDATA(text) {
  if (!text) return text;
  return text.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim();
}

async function cleanBlogs() {
  console.log('Fetching blogs...');
  const { data: blogs, error: fetchError } = await supabase
    .from('blogs')
    .select('*');

  if (fetchError) {
    console.error('Error fetching blogs:', fetchError);
    return;
  }

  console.log(`Found ${blogs.length} blogs to process.`);

  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i];
    
    const newTitle = stripCDATA(blog.title);
    const newExcerpt = stripCDATA(blog.excerpt);
    const newContent = stripCDATA(blog.content);
    
    // Assign a new cover image
    const newCover = coverImages[i % coverImages.length];

    const updates = {};
    let needsUpdate = false;

    if (blog.title !== newTitle) { updates.title = newTitle; needsUpdate = true; }
    if (blog.excerpt !== newExcerpt) { updates.excerpt = newExcerpt; needsUpdate = true; }
    if (blog.content !== newContent) { updates.content = newContent; needsUpdate = true; }
    
    // Always update cover if it contains netflix or we just want to reset it
    if (blog.cover_image && blog.cover_image.includes('netflix')) {
      updates.cover_image = newCover;
      needsUpdate = true;
    } else {
        // Force update covers to ensure they look good
        updates.cover_image = newCover;
        needsUpdate = true;
    }

    if (needsUpdate) {
      console.log(`Updating blog: ${blog.slug}`);
      const { error: updateError } = await supabase
        .from('blogs')
        .update(updates)
        .eq('id', blog.id);

      if (updateError) {
        console.error(`Error updating blog ${blog.id}:`, updateError);
      }
    }
  }

  console.log('Finished processing blogs.');
}

cleanBlogs();
