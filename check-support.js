
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSupportMessages() {
    const { data: messages, error } = await supabase
        .from('client_support_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (error) {
        console.error('Fetch error:', error);
        return;
    }

    console.log('--- RECENT SUPPORT MESSAGES ---');
    console.log(messages);
}

checkSupportMessages();
