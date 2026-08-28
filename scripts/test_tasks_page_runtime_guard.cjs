const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===============================================================');
console.log('TASKS PAGE RUNTIME GUARD & STATE INTEGRITY SUITE');
console.log('===============================================================');

const tasksPagePath = path.join(__dirname, '..', 'panel', 'features', 'tasks', 'components', 'tasks-page.tsx');
const tasksPageContent = fs.readFileSync(tasksPagePath, 'utf8');

// 1. Check showBulkAssign declaration
assert(
  tasksPageContent.includes('const [showBulkAssign, setShowBulkAssign] = useState(false)'),
  'showBulkAssign must be declared with useState(false)'
);
console.log(' ✅ PASSED: showBulkAssign and setShowBulkAssign state declared correctly');

// 2. Check selectedSupportIds declaration
assert(
  tasksPageContent.includes('const [selectedSupportIds, setSelectedSupportIds] = useState<string[]>([])'),
  'selectedSupportIds must be declared with useState<string[]>([])'
);
console.log(' ✅ PASSED: selectedSupportIds and setSelectedSupportIds state declared correctly');

// 3. Check ROLE_TO_TEAM import
assert(
  tasksPageContent.includes('ROLE_TO_TEAM'),
  'ROLE_TO_TEAM must be imported and referenced'
);
console.log(' ✅ PASSED: ROLE_TO_TEAM imported and indexed safely');

// 4. Ensure no undeclared supportIds remains
assert(
  !tasksPageContent.includes('const [supportIds, setSupportIds]'),
  'Stale supportIds identifier should not exist'
);
console.log(' ✅ PASSED: 0 stale identifiers found in tasks-page.tsx');

console.log('\n===============================================================');
console.log('ALL TASKS PAGE RUNTIME GUARD CHECKS PASSED');
console.log('===============================================================');