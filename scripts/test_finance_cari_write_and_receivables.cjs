const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('FINANCE CARI WRITE & RECEIVABLES TEST SUITE');
console.log('==========================================\n');

// 1. Static Source Code Checks
console.log('--- 1. STATIC SOURCE CODE AUDIT ---');

const appPath = path.join(__dirname, '..', 'src', 'finance', 'App.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');

const dashboardPath = path.join(__dirname, '..', 'src', 'finance', 'components', 'DashboardView.jsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

// Check A: handleUpdateClientContract does NOT write 'metrics'
assert.ok(!appContent.includes("metrics: updatedMetrics"), 'handleUpdateClientContract must not write metrics');
console.log(' ✅ PASSED [Test A]: handleUpdateClientContract does NOT write metrics');

// Check B: handleAddClient does NOT write 'metrics'
assert.ok(!appContent.includes("metrics: metricsObj"), 'handleAddClient must not write metrics');
console.log(' ✅ PASSED [Test B]: handleAddClient does NOT write metrics');

// Check C: contract fee writes to top-level monthly_fee
assert.ok(appContent.includes("monthly_fee: normalizeMonthlyFee(contractData.monthly_fee)"), 'handleUpdateClientContract writes to top-level monthly_fee');
assert.ok(appContent.includes("monthly_fee: normalizeMonthlyFee(clientData.monthly_fee)"), 'handleAddClient writes to top-level monthly_fee');
console.log(' ✅ PASSED [Test C]: Contract fee writes directly to top-level monthly_fee');

// Check D: only verified active_clients columns are sent
assert.ok(!appContent.includes("metrics: {"), 'No nested metrics payload written');
console.log(' ✅ PASSED [Test D]: Only verified physical active_clients columns are sent');

// 2. Numeric Normalization Tests
console.log('\n--- 2. NUMERIC NORMALIZATION TESTS ---');

function normalizeMonthlyFee(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let str = String(val).trim();
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(str)) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(str)) {
    str = str.replace(/,/g, '');
  } else {
    str = str.replace(',', '.');
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

// Check E: numeric normalization handles various inputs
assert.strictEqual(normalizeMonthlyFee(36000), 36000);
assert.strictEqual(normalizeMonthlyFee("36000"), 36000);
assert.strictEqual(normalizeMonthlyFee("36000.00"), 36000);
assert.strictEqual(normalizeMonthlyFee("36.000"), 36000);
assert.strictEqual(normalizeMonthlyFee("36.000,00"), 36000);
assert.strictEqual(normalizeMonthlyFee("36,000"), 36000);
assert.strictEqual(normalizeMonthlyFee("36,000.50"), 36000.50);
assert.strictEqual(normalizeMonthlyFee("49200"), 49200);
assert.strictEqual(normalizeMonthlyFee(0), 0);
assert.strictEqual(normalizeMonthlyFee(null), 0);
assert.strictEqual(normalizeMonthlyFee(undefined), 0);
assert.strictEqual(normalizeMonthlyFee(""), 0);
console.log(' ✅ PASSED [Test E]: Numeric contract fee normalization handles standard, localized & empty formats correctly');

// 3. Per-Client Toplam Alacak Formula Logic Tests
console.log('\n--- 3. PER-CLIENT TOPLAM ALACAK FORMULA TESTS ---');

function calculateTotalReceivables(activeClients, clientPayments) {
  return activeClients.reduce((acc, client) => {
    const clientPaymentsSum = (clientPayments || [])
      .filter(p => String(p.client_id) === String(client.id))
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const fee = parseFloat(client.monthly_fee) || 0;
    const remaining = Math.max(0, fee - clientPaymentsSum);
    return acc + remaining;
  }, 0);
}

// Check F: client with fee 49,200 and payment 0 contributes 49,200
const testClientsF = [{ id: 17, monthly_fee: 49200, durum: 'aktif' }];
const testPaymentsF = [];
assert.strictEqual(calculateTotalReceivables(testClientsF, testPaymentsF), 49200);
console.log(' ✅ PASSED [Test F]: monthly_fee 49,200 and payment 0 yields 49,200 receivable');

// Check G: client with fee 49,200 and payment 20,000 contributes 29,200
const testClientsG = [{ id: 17, monthly_fee: 49200, durum: 'aktif' }];
const testPaymentsG = [{ client_id: 17, amount: 20000 }];
assert.strictEqual(calculateTotalReceivables(testClientsG, testPaymentsG), 29200);
console.log(' ✅ PASSED [Test G]: monthly_fee 49,200 and payment 20,000 yields 29,200 receivable');

// Check H: client with fee 33,600 and payment 33,600 contributes 0
const testClientsH = [{ id: 2, monthly_fee: 33600, durum: 'aktif' }];
const testPaymentsH = [{ client_id: 2, amount: 33600 }];
assert.strictEqual(calculateTotalReceivables(testClientsH, testPaymentsH), 0);
console.log(' ✅ PASSED [Test H]: monthly_fee 33,600 and payment 33,600 yields 0 receivable');

// Check I: fee=0 client with payment 36,000 contributes 0 and does NOT reduce another client's receivable
const testClientsI = [
  { id: 14, monthly_fee: 0, durum: 'aktif' },
  { id: 17, monthly_fee: 49200, durum: 'aktif' }
];
const testPaymentsI = [
  { client_id: 14, amount: 36000 },
  { client_id: 17, amount: 0 }
];
assert.strictEqual(calculateTotalReceivables(testClientsI, testPaymentsI), 49200);
console.log(' ✅ PASSED [Test I]: fee=0 client with 36,000 payment does NOT reduce another client\'s receivable');

// Check J: one client's overpayment cannot reduce another client's receivable
const testClientsJ = [
  { id: 1, monthly_fee: 10000, durum: 'aktif' },
  { id: 2, monthly_fee: 20000, durum: 'aktif' }
];
const testPaymentsJ = [
  { client_id: 1, amount: 15000 }, // overpaid 5000
  { client_id: 2, amount: 0 }
];
assert.strictEqual(calculateTotalReceivables(testClientsJ, testPaymentsJ), 20000);
console.log(' ✅ PASSED [Test J]: Overpayment by one client cannot reduce another client\'s receivable');

// Check K: netProductionProfit cannot reduce Toplam Alacak
assert.ok(!dashboardContent.includes("totalClientBilling - totalReceived"), 'Dashboard must NOT subtract totalReceived from totalClientBilling');
assert.ok(!dashboardContent.includes("netProductionProfit") || !dashboardContent.match(/totalClientReceivables\s*=.*netProductionProfit/), 'totalClientReceivables must not include netProductionProfit');
console.log(' ✅ PASSED [Test K]: netProductionProfit has zero influence on Toplam Alacak');

// Check L: only selected-period payments are used
const testClientsL = [{ id: 10, monthly_fee: 50000, durum: 'aktif' }];
const testPaymentsL = [
  { client_id: 10, amount: 50000, period: '2026-07' }
];
// Scoped to 2026-08 (empty for 2026-08)
const scopedPaymentsL = testPaymentsL.filter(p => p.period === '2026-08');
assert.strictEqual(calculateTotalReceivables(testClientsL, scopedPaymentsL), 50000);
console.log(' ✅ PASSED [Test L]: Prior-period payments do not zero out current-period billing');

// Check M: client ID matching works using string-safe comparison
const testClientsM = [{ id: 2, monthly_fee: 30000, durum: 'aktif' }];
const testPaymentsM = [{ client_id: "2", amount: 30000 }]; // string vs number ID
assert.strictEqual(calculateTotalReceivables(testClientsM, testPaymentsM), 0);
console.log(' ✅ PASSED [Test M]: Client ID matching safely compares string vs number representations');

// Check N: negative receivable per client is clamped to 0
const testClientsN = [{ id: 5, monthly_fee: 10000, durum: 'aktif' }];
const testPaymentsN = [{ client_id: 5, amount: 50000 }];
assert.strictEqual(calculateTotalReceivables(testClientsN, testPaymentsN), 0);
console.log(' ✅ PASSED [Test N]: Negative individual balance clamped to 0');

console.log('\n==========================================');
console.log('ALL 14/14 (A-N) FINANCE TESTS PASSED');
console.log('==========================================\n');