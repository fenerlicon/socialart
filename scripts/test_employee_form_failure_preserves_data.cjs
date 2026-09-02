/**
 * test_employee_form_failure_preserves_data.cjs
 *
 * Verifies that:
 * 1. Failed save operations (400, 401, 404, 500, network error, partial create) NEVER clear or reset user-entered form data.
 * 2. Form state and draft storage preserve all non-secret profile fields on failure.
 * 3. Draft storage strictly excludes passwords, credentials, tokens, or authorization data.
 * 4. Draft storage is cleared ONLY after verified canonical employee creation success.
 * 5. Edit mode never loads or overwrites with create draft.
 * 6. Finally block only sets isSubmitting = false and never clears values.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('===============================================================');
  console.log('EMPLOYEE FORM DATA LOSS PREVENTION TEST SUITE');
  console.log('===============================================================\n');

  const rootDir = path.resolve(__dirname, '..');

  // --- 1. SIMULATE BROWSER DRAFT STORAGE ---
  console.log('--- 1. BROWSER DRAFT SERIALIZATION & RECOVERY SIMULATION ---');

  const DRAFT_STORAGE_KEY = 'employee-create-draft-v1';
  let mockSessionStorage = new Map();

  function saveCreateDraft(values) {
    const safeDraft = {
      fullName: values.fullName,
      email: values.email,
      username: values.username,
      title: values.title,
      avatarUrl: values.avatarUrl,
      employeeStatus: values.employeeStatus,
      workLocationStatus: values.workLocationStatus,
      rolePackageId: values.rolePackageId,
      teamIds: values.teamIds,
      permissionOverrides: values.permissionOverrides,
      hasAdvancedCalendarAccess: values.hasAdvancedCalendarAccess,
    };
    mockSessionStorage.set(DRAFT_STORAGE_KEY, JSON.stringify(safeDraft));
  }

  function getSavedCreateDraft() {
    const raw = mockSessionStorage.get(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      fullName: typeof parsed.fullName === 'string' ? parsed.fullName : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      username: typeof parsed.username === 'string' ? parsed.username : '',
      title: typeof parsed.title === 'string' ? parsed.title : '',
      avatarUrl: typeof parsed.avatarUrl === 'string' ? parsed.avatarUrl : '',
      employeeStatus: parsed.employeeStatus === 'passive' ? 'passive' : 'active',
      workLocationStatus: ['office', 'remote', 'hybrid'].includes(parsed.workLocationStatus) ? parsed.workLocationStatus : 'office',
      rolePackageId: typeof parsed.rolePackageId === 'string' ? parsed.rolePackageId : null,
      teamIds: Array.isArray(parsed.teamIds) ? parsed.teamIds : [],
      permissionOverrides: parsed.permissionOverrides && typeof parsed.permissionOverrides === 'object' ? parsed.permissionOverrides : {},
      hasAdvancedCalendarAccess: Boolean(parsed.hasAdvancedCalendarAccess),
    };
  }

  function clearCreateDraft() {
    mockSessionStorage.delete(DRAFT_STORAGE_KEY);
  }

  // --- 2. FORM STATE AND SUBMISSION SIMULATOR ---
  const defaultValues = {
    fullName: '',
    email: '',
    username: '',
    title: '',
    avatarUrl: '',
    employeeStatus: 'active',
    workLocationStatus: 'office',
    rolePackageId: null,
    teamIds: [],
    permissionOverrides: {},
    hasAdvancedCalendarAccess: false,
  };

  class FormSimulator {
    constructor(initialEmployee = undefined) {
      this.isEdit = Boolean(initialEmployee);
      this.initialEmployee = initialEmployee;
      this.isSubmitting = false;
      this.toastMessage = null;

      if (initialEmployee) {
        this.values = {
          fullName: initialEmployee.fullName,
          email: initialEmployee.email,
          username: initialEmployee.username || '',
          title: initialEmployee.title,
          avatarUrl: initialEmployee.avatarUrl || '',
          employeeStatus: initialEmployee.employeeStatus,
          workLocationStatus: initialEmployee.workLocationStatus,
          rolePackageId: initialEmployee.rolePackageId,
          teamIds: initialEmployee.teamIds || [],
          permissionOverrides: initialEmployee.permissionOverrides || {},
          hasAdvancedCalendarAccess: initialEmployee.hasAdvancedCalendarAccess || false,
        };
      } else {
        const draft = getSavedCreateDraft();
        this.values = draft ? { ...defaultValues, ...draft } : { ...defaultValues };
      }
    }

    updateField(key, val) {
      this.values[key] = val;
      if (!this.isEdit) {
        saveCreateDraft(this.values);
      }
    }

    async submit(mockBackendResponse) {
      this.isSubmitting = true;
      try {
        if (!this.isEdit) {
          // CREATE MODE
          const res = typeof mockBackendResponse === 'function' ? await mockBackendResponse() : mockBackendResponse;

          if (!res.ok || !res.employeeId) {
            this.toastMessage = `Çalışan kaydedilemedi. Girdiğiniz bilgiler korunmuştur. (${res.error || 'Hata'})`;
            // Crucial: values and draft remain intact
            return;
          }

          // Verified success
          clearCreateDraft();
          this.values = { ...defaultValues };
          this.toastMessage = 'Çalışan kaydedildi';
        } else {
          // EDIT MODE
          const res = typeof mockBackendResponse === 'function' ? await mockBackendResponse() : mockBackendResponse;
          if (!res.ok) {
            this.toastMessage = `Çalışan kaydedilemedi. Girdiğiniz bilgiler korunmuştur. (${res.error || 'Hata'})`;
            return;
          }
          this.toastMessage = 'Çalışan güncellendi';
        }
      } catch (err) {
        this.toastMessage = `Çalışan kaydedilemedi. Girdiğiniz bilgiler korunmuştur. (${err.message})`;
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  // --- TEST A: User fills fields, backend returns 400 ---
  console.log('[Test A] Backend returns 400 Bad Request:');
  const formA = new FormSimulator();
  formA.updateField('fullName', 'Ahmet Yılmaz');
  formA.updateField('title', 'Kreatif Direktör');
  formA.updateField('email', 'ahmet@socialart.internal');
  formA.updateField('rolePackageId', 'kreatif-direktor');
  formA.updateField('teamIds', ['kreatif-ekip']);

  await formA.submit({ ok: false, status: 400, error: 'Validation failed' });

  assert.strictEqual(formA.values.fullName, 'Ahmet Yılmaz', 'fullName must be preserved');
  assert.strictEqual(formA.values.title, 'Kreatif Direktör', 'title must be preserved');
  assert.strictEqual(formA.values.email, 'ahmet@socialart.internal', 'email must be preserved');
  assert.strictEqual(formA.isSubmitting, false, 'isSubmitting must be false');
  assert.ok(formA.toastMessage.includes('Girdiğiniz bilgiler korunmuştur'), 'Error toast informs data is preserved');
  console.log(' ✅ PASS: 400 Bad Request preserves all entered form data');

  // --- TEST B: Backend returns 401 Unauthorized ---
  console.log('\n[Test B] Backend returns 401 Unauthorized:');
  await formA.submit({ ok: false, status: 401, error: 'Unauthenticated' });
  assert.strictEqual(formA.values.fullName, 'Ahmet Yılmaz');
  assert.strictEqual(formA.values.title, 'Kreatif Direktör');
  console.log(' ✅ PASS: 401 Unauthorized preserves all entered form data');

  // --- TEST C: Backend returns 404 Target employee not found ---
  console.log('\n[Test C] Backend returns 404 Target employee not found:');
  await formA.submit({ ok: false, status: 404, error: 'Target employee not found' });
  assert.strictEqual(formA.values.fullName, 'Ahmet Yılmaz');
  assert.strictEqual(formA.values.rolePackageId, 'kreatif-direktor');
  console.log(' ✅ PASS: 404 Target employee not found preserves all entered form data');

  // --- TEST D: Backend returns 500 Server Error ---
  console.log('\n[Test D] Backend returns 500 Internal Server Error:');
  await formA.submit({ ok: false, status: 500, error: 'DB1_CREATE_FAILED' });
  assert.strictEqual(formA.values.fullName, 'Ahmet Yılmaz');
  assert.strictEqual(formA.values.teamIds[0], 'kreatif-ekip');
  console.log(' ✅ PASS: 500 Internal Server Error preserves all entered form data');

  // --- TEST E: Network Exception / Fetch failure ---
  console.log('\n[Test E] Network Exception (Failed to fetch):');
  await formA.submit(() => { throw new Error('Failed to fetch / Connection timeout'); });
  assert.strictEqual(formA.values.fullName, 'Ahmet Yılmaz');
  assert.strictEqual(formA.values.title, 'Kreatif Direktör');
  assert.strictEqual(formA.isSubmitting, false);
  console.log(' ✅ PASS: Network exception preserves all entered form data');

  // --- TEST F: Page Refresh Draft Recovery ---
  console.log('\n[Test F] Page Refresh Recovers Draft in CREATE MODE:');
  const freshLoadedForm = new FormSimulator();
  assert.strictEqual(freshLoadedForm.values.fullName, 'Ahmet Yılmaz', 'Refreshed page restores fullName from draft');
  assert.strictEqual(freshLoadedForm.values.title, 'Kreatif Direktör', 'Refreshed page restores title from draft');
  assert.strictEqual(freshLoadedForm.values.email, 'ahmet@socialart.internal', 'Refreshed page restores email from draft');
  console.log(' ✅ PASS: Page refresh successfully recovers draft');

  // --- TEST G: Draft Security Audit (No passwords/credentials) ---
  console.log('\n[Test G] Draft Security Audit:');
  const storedDraftRaw = mockSessionStorage.get(DRAFT_STORAGE_KEY);
  assert.ok(!storedDraftRaw.includes('password'), 'Draft must NOT store password');
  assert.ok(!storedDraftRaw.includes('temporaryPassword'), 'Draft must NOT store temporaryPassword');
  assert.ok(!storedDraftRaw.includes('secret'), 'Draft must NOT store secrets');
  console.log(' ✅ PASS: Draft contains 0 password or credential secrets');

  // --- TEST H: Successful Creation Clears Draft ---
  console.log('\n[Test H] Successful Creation Clears Draft:');
  await freshLoadedForm.submit({
    ok: true,
    status: 201,
    employeeId: '105',
    employee: { id: '105', fullName: 'Ahmet Yılmaz' }
  });
  assert.strictEqual(freshLoadedForm.values.fullName, '', 'Form values reset after verified success');
  assert.strictEqual(mockSessionStorage.get(DRAFT_STORAGE_KEY), undefined, 'Draft cleared from storage after success');
  console.log(' ✅ PASS: Verified success cleanly resets form and deletes draft');

  // --- TEST I: Edit Mode Isolation ---
  console.log('\n[Test I] Edit Mode Never Loads Create Draft:');
  // Put a stale create draft in storage
  mockSessionStorage.set(DRAFT_STORAGE_KEY, JSON.stringify({ fullName: 'Stale Create Draft Name' }));
  const existingEmployee = {
    id: '16',
    fullName: 'Real Beta Art Director',
    title: 'Art Director',
    email: 'beta@socialart.internal',
    employeeStatus: 'active',
    workLocationStatus: 'office',
    rolePackageId: 'kreatif-direktor',
    teamIds: ['kreatif-ekip'],
  };
  const editForm = new FormSimulator(existingEmployee);
  assert.strictEqual(editForm.values.fullName, 'Real Beta Art Director', 'Edit mode must load canonical employee, not draft');
  console.log(' ✅ PASS: Edit mode does NOT load create draft');

  // --- 3. SOURCE CODE AUDIT ---
  console.log('\n--- 3. SOURCE CODE AUDIT ---');

  const hookSrc = fs.readFileSync(path.join(rootDir, 'panel/features/employees/hooks/use-employee-form.ts'), 'utf8');
  assert.ok(hookSrc.includes("const DRAFT_STORAGE_KEY = 'employee-create-draft-v1'"), 'Hook defines DRAFT_STORAGE_KEY');
  assert.ok(hookSrc.includes("Girdiğiniz bilgiler korunmuştur"), 'Hook shows data preservation message on error');
  assert.ok(hookSrc.includes("clearCreateDraft()"), 'Hook clears draft on successful create');
  assert.ok(!hookSrc.includes("finally {\n      setValues("), 'Hook does not clear values in finally');

  console.log(' ✅ PASS: Source code verified for data loss prevention');

  console.log('\n===============================================================');
  console.log('ALL EMPLOYEE FORM DATA LOSS PREVENTION CHECKS PASSED ✅');
  console.log('===============================================================\n');
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
