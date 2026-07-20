const { test } = require('@playwright/test');

test('capture pricing section', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1400 });
  await page.goto('http://localhost:5173/fiyatlar', { waitUntil: 'networkidle' });
  
  // Scroll to section
  const container = page.locator('.container');
  await container.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  
  // Take screenshot of container
  await container.screenshot({
    path: 'C:\\Users\\Arda Furkan Aslanbaş\\.gemini\\antigravity\\brain\\2ca2e072-456c-4c75-9a32-a3d2c19ecaad\\media__fiyatlar_tam_net_paketler.png'
  });
});
