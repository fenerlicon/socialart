const readline = require('readline');
const { hashPassword, validatePasswordPolicy } = require('../api/_lib/admin-auth.js');
const { getAdminSupabase } = require('../api/_lib/admin-db.js');

function askQuestion(query, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (!hidden) {
      rl.question(query, (ans) => {
        rl.close();
        resolve(ans.trim());
      });
    } else {
      // Hidden input masking
      process.stdout.write(query);
      let input = '';
      process.stdin.resume();
      process.stdin.setRawMode?.(true);

      const onData = (char) => {
        const str = char.toString('utf8');
        if (str === '\n' || str === '\r' || str === '\u0004') {
          process.stdin.setRawMode?.(false);
          process.stdin.pause();
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          rl.close();
          resolve(input.trim());
        } else if (str === '\u0003') {
          // Ctrl+C
          process.exit(1);
        } else if (str === '\b' || str === '\x7f') {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          input += str;
          process.stdout.write('*');
        }
      };

      process.stdin.on('data', onData);
    }
  });
}

async function runProvisioning() {
  console.log('===============================================================');
  console.log('DEDICATED ADMIN PRINCIPAL — SECURE PROVISIONING TOOL');
  console.log('===============================================================\n');

  const username = await askQuestion('Admin Username (e.g. admin): ', false);
  if (!username || username.length < 3) {
    console.error(' ❌ Error: Username must be at least 3 characters.');
    process.exit(1);
  }

  const displayName = await askQuestion('Display Name (default: System Administrator): ', false) || 'System Administrator';

  const password = await askQuestion('Admin Password (min 12 chars): ', true);
  if (!password || password.length < 12) {
    console.error(' ❌ Error: Password must be at least 12 characters.');
    process.exit(1);
  }

  const confirmPassword = await askQuestion('Confirm Admin Password: ', true);
  if (password !== confirmPassword) {
    console.error(' ❌ Error: Passwords do not match.');
    process.exit(1);
  }

  console.log('\n--- PROVISIONING ADMIN TO DATABASE ---');
  const db1 = getAdminSupabase();

  // 1. Check existing username collision
  const { data: existing, error: checkErr } = await db1
    .from('admin_auth_identities')
    .select('id, username')
    .eq('username', username.toLowerCase())
    .maybeSingle();

  if (checkErr) {
    console.error(' ❌ Database error checking admin identity:', checkErr.message);
    process.exit(1);
  }

  if (existing) {
    console.error(' ❌ Error: Admin identity with username "' + username + '" already exists.');
    process.exit(1);
  }

  // 2. Hash password with scrypt
  const passwordHash = hashPassword(password);

  // 3. Insert Admin identity
  const { data: inserted, error: insertErr } = await db1
    .from('admin_auth_identities')
    .insert({
      username: username.toLowerCase(),
      display_name: displayName,
      password_hash: passwordHash,
      password_version: 1,
      is_active: true,
      must_change_password: false,
    })
    .select('id, username, display_name, is_active, created_at')
    .single();

  if (insertErr) {
    console.error(' ❌ Failed to insert admin identity:', insertErr.message);
    process.exit(1);
  }

  console.log(' ✅ SUCCESS: Dedicated Admin principal provisioned!');
  console.log('    ID:          ', inserted.id);
  console.log('    Username:    ', inserted.username);
  console.log('    Display Name:', inserted.display_name);
  console.log('    Created At:  ', inserted.created_at);
  console.log('\n===============================================================');
}

if (require.main === module) {
  runProvisioning().catch((err) => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
}

module.exports = { runProvisioning };

