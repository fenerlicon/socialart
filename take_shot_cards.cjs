const npxPath = 'C:\\Users\\Arda Furkan Aslanbaş\\AppData\\Local\\npm-cache\\_npx\\e41f203b7505f1fb\\node_modules\\playwright';
const { chromium } = require(npxPath);

(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1400 }, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5173/fiyatlar', { waitUntil: 'networkidle', timeout: 30000 });
    
    const cards = await page.$$('.glass');
    for (let i = 0; i < cards.length; i++) {
      const outputPath = `C:\\Users\\Arda Furkan Aslanbaş\\.gemini\\antigravity\\brain\\2ca2e072-456c-4c75-9a32-a3d2c19ecaad\\media__paket_${i+1}_detay.png`;
      await cards[i].screenshot({ path: outputPath });
      console.log(`Card ${i+1} screenshot saved to:`, outputPath);
    }

    await browser.close();
  } catch (e) {
    console.error('Error:', e);
  }
})();
