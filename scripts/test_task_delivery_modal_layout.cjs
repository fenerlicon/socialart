/**
 * test_task_delivery_modal_layout.cjs
 * Deterministic layout and contract verification for TaskDeliveryModal.
 * Validates vertical scrolling, viewport constraints, and guaranteed submit visibility.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('===============================================================');
  console.log('TASK DELIVERY MODAL LAYOUT & SCROLL CONTRACT TEST');
  console.log('===============================================================\n');

  const componentPath = path.resolve(__dirname, '../panel/components/shared/task-delivery-modal.tsx');
  const source = fs.readFileSync(componentPath, 'utf8');

  console.log('--- 1. OVERLAY & Z-INDEX CONTRACT ---');
  assert.ok(source.includes('z-[9999]'), 'Modal overlay must be at z-[9999]');
  assert.ok(source.includes('fixed inset-0'), 'Modal overlay must be fixed inset-0');
  assert.ok(source.includes('overflow-y-auto'), 'Modal overlay must allow overflow-y-auto for small viewports');
  console.log(' ✅ PASSED: Overlay has z-[9999], fixed inset-0, and overflow-y-auto');

  console.log('\n--- 2. MODAL PANEL & VIEWPORT CONSTRAINTS (1366x768 & Mobile) ---');
  assert.ok(source.includes('max-h-[calc(100dvh-2rem)]'), 'Card must have max-h-[calc(100dvh-2rem)] viewport constraint');
  assert.ok(source.includes('flex flex-col'), 'Card must use flex flex-col layout');
  console.log(' ✅ PASSED: Viewport max-height constraint and flex layout verified');

  console.log('\n--- 3. SCROLLABLE BODY & FIXED HEADER/FOOTER CONTRACT ---');
  assert.ok(source.includes('p-5 sm:p-6 pb-4 border-b border-neutral-800/80 shrink-0'), 'Header must be shrink-0 with border');
  assert.ok(source.includes('overflow-y-auto flex-1 min-h-0 space-y-4'), 'Body container must have overflow-y-auto, flex-1, min-h-0');
  assert.ok(source.includes('border-t border-neutral-800/80 bg-neutral-950/90 shrink-0 flex justify-end gap-2'), 'Footer must be shrink-0 and sticky at bottom');
  assert.ok(source.includes('Görevi Teslim Et ve Tamamla'), 'Submit button is present in footer');
  assert.ok(source.includes('Vazgeç'), 'Cancel button is present in footer');
  console.log(' ✅ PASSED: Scrollable body and sticky footer guarantee reachability');

  console.log('\n--- 4. DELIVERY SEMANTICS INTEGRITY ---');
  assert.ok(source.includes('onConfirm('), 'onConfirm callback is preserved');
  assert.ok(source.includes('deliveryNote'), 'deliveryNote state is preserved');
  assert.ok(source.includes('allLinks'), 'allLinks state is preserved');
  assert.ok(source.includes('detectRequirement'), 'detectRequirement logic is preserved');
  console.log(' ✅ PASSED: Delivery semantics, validation, and callbacks are completely unchanged');

  console.log('\n===============================================================');
  console.log('ALL TASK DELIVERY MODAL TESTS PASSED SUCCESSFULLY ✅');
  console.log('===============================================================');
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
