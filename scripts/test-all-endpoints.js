import pkg from 'pg';
const { Client } = pkg;
import { createClient } from '@supabase/supabase-js';

const password = 'bvwW+Qg7LS&u3V&';
const escapedPassword = encodeURIComponent(password);

const PRIMARY_SUPABASE_URL = 'https://osuwytugjscwhcxxkhfa.supabase.co';
const PRIMARY_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';
const LEADS_SUPABASE_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const LEADS_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2OTMzMSwiZXhwIjoyMDk0MzQ1MzMxfQ.DT3n6RNiwA_Tr_xt9iHRqWpDH718lFamct9tAXG8E2w';

const supabasePrimary = createClient(PRIMARY_SUPABASE_URL, PRIMARY_SUPABASE_KEY);
const supabaseLeads = createClient(LEADS_SUPABASE_URL, LEADS_SUPABASE_KEY);

async function testAll() {
  console.log('--- 1. Testing Leads Queries & Inserts ---');
  // 1. Leads Select
  const { data: leadsSelect, error: lsErr } = await supabaseLeads.from('leads').select('*').limit(3);
  console.log('Leads Select:', lsErr ? '❌ ' + lsErr.message : `✅ OK (${leadsSelect.length} rows)`);

  // 2. Leads Insert
  const testLead = {
    name: 'Schema Audit Lead',
    phone: '05550001122',
    title: 'Audit Co',
    service: 'Sosyal Medya',
    budget: 25000,
    rep: 'Furkan',
    city: 'Istanbul',
    status: 'Sıcak',
    stage: 'NEW',
    platform: 'ChatGPT AI Assistant',
    date: '12.08.2026',
    reaction: 'Test reaction',
    notes: [{ id: 'NOTE-1', text: 'Test note', author: 'ChatGPT' }]
  };
  const { data: leadIns, error: liErr } = await supabaseLeads.from('leads').insert([testLead]).select().single();
  console.log('Leads Insert:', liErr ? '❌ ' + liErr.message : `✅ OK (ID: ${leadIns?.id})`);
  if (leadIns) {
    // 3. Leads Update (Lead Note)
    const { error: luErr } = await supabaseLeads.from('leads').update({
      notes: [{ id: 'NOTE-2', text: 'Updated note' }],
      reaction: 'Updated reaction'
    }).eq('id', leadIns.id);
    console.log('Leads Update:', luErr ? '❌ ' + luErr.message : '✅ OK');
    await supabaseLeads.from('leads').delete().eq('id', leadIns.id);
  }

  console.log('\n--- 2. Testing Calendar Events ---');
  const testCal = {
    id: `CAL-TEST-${Date.now()}`,
    title: 'Audit Meeting',
    type: 'meeting',
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 3600000).toISOString(),
    location: 'Ajans Ofisi',
    status: 'pending'
  };
  const { data: calIns, error: calErr } = await supabasePrimary.from('calendar_events').insert([testCal]).select().single();
  console.log('Calendar Insert:', calErr ? '❌ ' + calErr.message : `✅ OK (ID: ${calIns?.id})`);
  if (calIns) {
    await supabasePrimary.from('calendar_events').delete().eq('id', calIns.id);
  }

  console.log('\n--- 3. Testing Payment Requests ---');
  const testPay = {
    id: `REQ-TEST-${Date.now()}`,
    client_name: 'Audit Client',
    company_code: 'auditclient',
    title: 'Audit Fee',
    description: 'Test fee',
    amount: 15000,
    kdv_amount: 3000,
    total_amount: 18000,
    status: 'pending'
  };
  const { data: payIns, error: payErr } = await supabasePrimary.from('payment_requests').insert([testPay]).select().single();
  console.log('Payment Request Insert:', payErr ? '❌ ' + payErr.message : `✅ OK (ID: ${payIns?.id})`);
  if (payIns) {
    await supabasePrimary.from('payment_requests').delete().eq('id', payIns.id);
  }

  console.log('\n--- 4. Testing Workflow Step Instances (Tasks) ---');
  const testTask = {
    id: `GPT-TASK-TEST-${Date.now()}`,
    workflow_instance_id: null,
    workflow_step_template_id: 'gpt-assigned-task',
    title: 'Audit Task',
    description: 'Test task',
    order: 1,
    status: 'active',
    requires_approval: false,
    is_final_step: false,
    assignee_employee_id: '26fff081-5502-4624-a71a-b6e4772467c3',
    assigned_employee_id: '26fff081-5502-4624-a71a-b6e4772467c3',
    responsibility_role: 'strategy',
    assigned_at: new Date().toISOString(),
    due_date: new Date().toISOString()
  };
  const { data: taskIns, error: taskErr } = await supabasePrimary.from('workflow_step_instances').insert([testTask]).select().single();
  console.log('Task (workflow_step_instances) Insert:', taskErr ? '❌ ' + taskErr.message : `✅ OK (ID: ${taskIns?.id})`);
  if (taskIns) {
    await supabasePrimary.from('workflow_step_instances').delete().eq('id', taskIns.id);
  }

  console.log('\n--- 5. Testing Personal Todos ---');
  const testTodo = {
    id: `TODO-TEST-${Date.now()}`,
    employee_id: '26fff081-5502-4624-a71a-b6e4772467c3',
    title: 'Audit Todo',
    notes: 'Test notes',
    due_date: '2026-08-15',
    priority: 'medium',
    category: 'general',
    is_completed: false
  };
  const { data: todoIns, error: todoErr } = await supabasePrimary.from('personal_todos').insert([testTodo]).select().single();
  console.log('Personal Todo Insert:', todoErr ? '❌ ' + todoErr.message : `✅ OK (ID: ${todoIns?.id})`);
  if (todoIns) {
    await supabasePrimary.from('personal_todos').delete().eq('id', todoIns.id);
  }

  console.log('\n--- 6. Testing Notifications ---');
  const testNotif = {
    id: `NOTIF-TEST-${Date.now()}`,
    recipient_employee_id: '26fff081-5502-4624-a71a-b6e4772467c3',
    type: 'calendar_event',
    title: 'Test Title',
    message: 'Test message',
    related_entity_type: 'calendar',
    related_entity_id: '123',
    is_read: false
  };
  const { data: notifIns, error: notifErr } = await supabasePrimary.from('notifications').insert([testNotif]).select().single();
  console.log('Notification Insert:', notifErr ? '❌ ' + notifErr.message : `✅ OK (ID: ${notifIns?.id})`);
  if (notifIns) {
    await supabasePrimary.from('notifications').delete().eq('id', notifIns.id);
  }

  console.log('\n--- 7. Testing Client Portal & Customer Accounts Queries ---');
  const { data: custAcc, error: caErr } = await supabasePrimary.from('customer_accounts').select('*').limit(3);
  console.log('Customer Accounts Select:', caErr ? '❌ ' + caErr.message : `✅ OK (${custAcc?.length} rows)`);

  const { data: actCli, error: acErr } = await supabasePrimary.from('active_clients').select('*').limit(3);
  console.log('Active Clients Select:', acErr ? '❌ ' + acErr.message : `✅ OK (${actCli?.length} rows)`);

  const { data: brands, error: brErr } = await supabasePrimary.from('brands').select('*').limit(3);
  console.log('Brands Select:', brErr ? '❌ ' + brErr.message : `✅ OK (${brands?.length} rows)`);
}

testAll();
