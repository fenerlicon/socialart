
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function purgeAllMessages() {
    console.log('--- PURGING TEST DATA ---');
    
    // 1. Delete all support messages (requests and chat)
    const { error: msgError } = await supabase
        .from('client_support_messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes all records

    if (msgError) console.error('Error deleting messages:', msgError);
    else console.log('Successfully deleted all support messages and requests.');

    // 2. Clean up activity logs that might mention test actions
    const { error: logError } = await supabase
        .from('activity_log')
        .delete()
        .or('details.ilike.%talep%,details.ilike.%test%,details.ilike.%deneme%');

    if (logError) console.error('Error deleting logs:', logError);
    else console.log('Successfully cleaned up test-related activity logs.');
}

purgeAllMessages();
