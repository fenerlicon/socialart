const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { hashPassword, validatePasswordPolicy } = require('../api/_lib/admin-auth.js');
const { getAdminSupabase } = require('../api/_lib/admin-db.js');

/**
 * Pure parser for raw terminal chunks supporting Backspace, Ctrl+C, and CR/LF
 */
function parseRawInputChunk(chunk, currentBuffer, isHidden = false, onCharCallback = null) {
  let buf = currentBuffer;
  let isDone = false;
  let isAborted = false;

  for (let i = 0; i < chunk.length; i++) {
    const char = chunk[i];
    if (char === '\r' || char === '\n' || char === '\u0004') {
      isDone = true;
      break;
    } else if (char === '\u0003') {
      isAborted = true;
      break;
    } else if (char === '\b' || char === '\x7f') {
      if (buf.length > 0) {
        buf = buf.slice(0, -1);
        if (onCharCallback) onCharCallback('backspace');
      }
    } else if (char >= ' ') {
      buf += char;
      if (onCharCallback) onCharCallback(isHidden ? 'mask' : char);
    }
  }

  return { buffer: buf, isDone, isAborted };
}

/**
 * Unified, handle-safe interactive terminal prompter without readline handle conflicts
 */
function promptTerminal(query, options = {}) {
  const isHidden = options.isHidden === true;

  return new Promise((resolve) => {
    process.stdout.write(query);
    let buffer = '';

    const isRawSupported = Boolean(process.stdin.setRawMode);
    if (isRawSupported) {
      try {
        process.stdin.setRawMode(true);
      } catch (e) {}
    }
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      if (isRawSupported) {
        try {
          process.stdin.setRawMode(false);
        } catch (e) {}
      }
      process.stdin.pause();
      process.stdin.removeListener('data', onData);
    };

    const onData = (chunk) => {
      const { buffer: newBuffer, isDone, isAborted } = parseRawInputChunk(
        chunk,
        buffer,
        isHidden,
        (action) => {
          if (action === 'backspace') {
            process.stdout.write('\b \b');
          } else if (action === 'mask') {
            process.stdout.write('*');
          } else {
            process.stdout.write(action);
          }
        }
      );

      buffer = newBuffer;

      if (isAborted) {
        cleanup();
        process.stdout.write('\n');
        process.exitCode = 1;
        resolve('');
        return;
      }

      if (isDone) {
        cleanup();
        process.stdout.write('\n');
        resolve(buffer.trim());
      }
    };

    process.stdin.on('data', onData);
  });
}

async function runProvisioning() {
  console.log('===============================================================');
  console.log('DEDICATED ADMIN PRINCIPAL — SECURE PROVISIONING TOOL');
  console.log('===============================================================\n');

  const username = await promptTerminal('Admin Username (e.g. admin): ');
  if (!username || username.length < 3) {
    console.error(' ❌ Error: Username must be at least 3 characters.');
    process.exitCode = 1;
    return;
  }

  const displayName = (await promptTerminal('Display Name (default: System Administrator): ')) || 'System Administrator';

  const password = await promptTerminal('Admin Password (min 12 chars): ', { isHidden: true });
  if (!password || password.length < 12) {
    console.error(' ❌ Error: Password must be at least 12 characters.');
    process.exitCode = 1;
    return;
  }

  const confirmPassword = await promptTerminal('Confirm Admin Password: ', { isHidden: true });
  if (password !== confirmPassword) {
    console.error(' ❌ Error: Passwords do not match.');
    process.exitCode = 1;
    return;
  }

  console.log('\n--- PROVISIONING ADMIN TO DATABASE ---');
  let db1;
  try {
    db1 = getAdminSupabase();
  } catch (initErr) {
    console.error(' ❌ Configuration error:', initErr.message);
    process.exitCode = 1;
    return;
  }

  // 1. Check existing username collision
  const { data: existing, error: checkErr } = await db1
    .from('admin_auth_identities')
    .select('id, username')
    .eq('username', username.toLowerCase())
    .maybeSingle();

  if (checkErr) {
    console.error(' ❌ Database error checking admin identity:', checkErr.message);
    process.exitCode = 1;
    return;
  }

  if (existing) {
    console.error(' ❌ Error: Admin identity with username "' + username + '" already exists.');
    process.exitCode = 1;
    return;
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
    process.exitCode = 1;
    return;
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
    console.error('Unhandled error:', err.message || err);
    process.exitCode = 1;
  });
}

module.exports = { runProvisioning, parseRawInputChunk, promptTerminal };



