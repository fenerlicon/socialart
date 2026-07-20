import { chromium } from 'playwright';

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1600, height: 1400 }, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5173/fiyatlar', { waitUntil: 'networkidle' });
    
    // Container element screenshot
    const container = page.locator('.container');
    await container.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    const outputPath = 'C:\\Users\\Arda Furkan Aslanbaş\\.gemini\\antigravity\\brain\\2ca2e072-456c-4c75-9a32-a3d2c19ecaad\\media__fiyatlar_tam_net_paketler.png';
    await container.screenshot({ path: outputPath });
    console.log('Saved to:', outputPath);

    await browser.close();
  } catch (e) {
    console.error('Error:', e);
  }
})();
