const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ts = require(path.join(__dirname, '../panel/node_modules/typescript'));

console.log('==========================================');
console.log('REAL PERMISSION RESOLVER RUNTIME TEST SUITE');
console.log('==========================================\n');

// 1. Setup on-the-fly TS loader for @/ aliases in panel/
const panelDir = path.join(__dirname, '../panel');

function loadTsModule(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    }
  });

  const m = { exports: {} };
  const customRequire = (reqPath) => {
    if (reqPath.startsWith('@/')) {
      const targetTs = path.join(panelDir, reqPath.slice(2) + '.ts');
      const targetTsx = path.join(panelDir, reqPath.slice(2) + '.tsx');
      if (fs.existsSync(targetTs)) return loadTsModule(targetTs);
      if (fs.existsSync(targetTsx)) return loadTsModule(targetTsx);
    }
    if (reqPath.startsWith('.')) {
      const resolved = path.resolve(path.dirname(filePath), reqPath);
      if (fs.existsSync(resolved)) {
        if (resolved.endsWith('.ts') || resolved.endsWith('.tsx')) {
          return loadTsModule(resolved);
        }
        if (resolved.endsWith('.js')) {
          const jsContent = fs.readFileSync(resolved, 'utf8');
          const transpiledJs = ts.transpileModule(jsContent, {
            compilerOptions: {
              module: ts.ModuleKind.CommonJS,
              target: ts.ScriptTarget.ES2020,
              esModuleInterop: true,
            }
          });
          const jsM = { exports: {} };
          const jsFn = new Function('module', 'exports', 'require', '__dirname', '__filename', transpiledJs.outputText);
          jsFn(jsM, jsM.exports, customRequire, path.dirname(resolved), resolved);
          return jsM.exports;
        }
      }
    }
    return require(reqPath);
  };

  const fn = new Function('module', 'exports', 'require', '__dirname', '__filename', transpiled.outputText);
  fn(m, m.exports, customRequire, path.dirname(filePath), filePath);
  return m.exports;
}

// 2. Load the REAL resolver module
const resolvePermissionsModule = loadTsModule(path.join(panelDir, 'lib/permissions/resolve-permissions.ts'));
const { resolveEffectivePermissions, buildDefaultPermissionSet } = resolvePermissionsModule;

// Test A: ROLE_PACKAGES_BY_ID runtime reference does not throw
assert.doesNotThrow(() => {
  buildDefaultPermissionSet({ rolePackageId: 'dijital-pazarlama' });
}, 'Test A FAIL: buildDefaultPermissionSet threw exception');
console.log(' ✅ PASSED [A]: ROLE_PACKAGES_BY_ID runtime reference executes cleanly without throwing ReferenceError');

// Test B: known role package resolves successfully
const dijitalDefaults = buildDefaultPermissionSet({ rolePackageId: 'dijital-pazarlama' });
assert(dijitalDefaults instanceof Map);
assert(dijitalDefaults.size > 0);
console.log(' ✅ PASSED [B]: Known role package (dijital-pazarlama) default map resolved with size ' + dijitalDefaults.size);

// Test C: role baseline permissions resolve
assert(dijitalDefaults.has('calendar.view'));
assert(dijitalDefaults.has('brands.view'));
assert(!dijitalDefaults.has('crm.view'));
console.log(' ✅ PASSED [C]: Role baseline contains expected defaults (calendar.view=true, crm.view=false)');

// Test D: individual true override expands baseline
const expanded = resolveEffectivePermissions({
  rolePackageId: 'dijital-pazarlama',
  permissionOverrides: { 'crm.view': true }
});
assert(expanded.grantedKeys.has('crm.view'), 'crm.view was not granted by override');
assert(expanded.grantedKeys.has('calendar.view'), 'calendar.view baseline was lost');
console.log(' ✅ PASSED [D]: Individual true override (crm.view=true) expands baseline cleanly');

// Test E: individual false override can narrow baseline
const narrowed = resolveEffectivePermissions({
  rolePackageId: 'dijital-pazarlama',
  permissionOverrides: { 'calendar.view': false }
});
assert(!narrowed.grantedKeys.has('calendar.view'), 'calendar.view was not revoked by override');
console.log(' ✅ PASSED [E]: Individual false override (calendar.view=false) narrows baseline cleanly');

// Test F: unknown/null role package fails safely without ReferenceError
assert.doesNotThrow(() => {
  const nullResult = resolveEffectivePermissions({ rolePackageId: null, permissionOverrides: {} });
  assert.strictEqual(nullResult.grantedKeys.size, 0);
  const unknownDefaults = buildDefaultPermissionSet({ rolePackageId: 'non-existent-package' });
  assert.strictEqual(unknownDefaults.size, 0);
}, 'Test F FAIL: null or unknown role package threw exception');
console.log(' ✅ PASSED [F]: null and unknown role packages fail safely to empty set without ReferenceError');

// Test G: ID 6-shaped auth employee resolves without throwing
const id6Employee = {
  id: '6',
  fullName: 'Arda Furkan Aslanbaş',
  rolePackageId: 'dijital-pazarlama',
  teamIds: [],
  permissionOverrides: {
    'crm.view': true,
    'crm.leads': true,
    'crm.proposals': true,
    'crm.manage': true,
    'ideas.view': true,
    'ideas.create': true,
    'employees.manage': true,
    'employees.create': true,
    'system.permissions': true,
    'system.admin': true,
  }
};

const id6Effective = resolveEffectivePermissions(id6Employee);

assert(id6Effective.grantedKeys.has('crm.view'), 'ID 6 missing crm.view');
assert(id6Effective.grantedKeys.has('crm.leads'), 'ID 6 missing crm.leads');
assert(id6Effective.grantedKeys.has('crm.proposals'), 'ID 6 missing crm.proposals');
assert(id6Effective.grantedKeys.has('crm.manage'), 'ID 6 missing crm.manage');
assert(id6Effective.grantedKeys.has('ideas.view'), 'ID 6 missing ideas.view');
assert(id6Effective.grantedKeys.has('ideas.create'), 'ID 6 missing ideas.create');
assert(id6Effective.grantedKeys.has('calendar.view'), 'ID 6 missing calendar.view');
assert(id6Effective.grantedKeys.has('employees.manage'), 'ID 6 missing employees.manage');
assert(id6Effective.grantedKeys.has('employees.create'), 'ID 6 missing employees.create');
assert(id6Effective.grantedKeys.has('system.permissions'), 'ID 6 missing system.permissions');
assert(id6Effective.grantedKeys.has('system.admin'), 'ID 6 missing system.admin');
assert(!id6Effective.grantedKeys.has('team.manage'), 'ID 6 MUST NOT have team.manage');

console.log(' ✅ PASSED [G]: ID 6 full runtime authorization profile resolves with exact expected permissions:');
console.log('   - crm.view: ' + (id6Effective.grantedKeys.has('crm.view') ? 'ENABLED' : 'DISABLED'));
console.log('   - ideas.view: ' + (id6Effective.grantedKeys.has('ideas.view') ? 'ENABLED' : 'DISABLED'));
console.log('   - system.admin: ' + (id6Effective.grantedKeys.has('system.admin') ? 'ENABLED' : 'DISABLED'));
console.log('   - team.manage: ' + (id6Effective.grantedKeys.has('team.manage') ? 'ENABLED' : 'DISABLED'));

// 3. Workspace Layout Static & Runtime Compatibility Audit
const workspaceLayoutCode = fs.readFileSync(path.join(panelDir, 'components/layout/workspace-layout.tsx'), 'utf8');
assert(workspaceLayoutCode.includes('resolveEffectivePermissions'), 'WorkspaceLayout does not call resolveEffectivePermissions');
assert(workspaceLayoutCode.includes("hasPermission('crm.view')"), 'WorkspaceLayout missing crm.view check');
console.log(' ✅ PASSED: WorkspaceLayout correctly uses resolveEffectivePermissions with hasPermission(crm.view)');

console.log('\n==========================================');
console.log('ALL RESOLVER RUNTIME CHECKS PASSED (0 FAILED)');
console.log('==========================================');
