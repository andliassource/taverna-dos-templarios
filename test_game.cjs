const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

  console.log('Navigating to game...');
  await page.goto('http://localhost:3000/');
  
  console.log('Waiting 3 seconds for boot...');
  await page.waitForTimeout(3000);
  
  console.log('Starting WorldScene directly...');
  await page.evaluate(() => {
    if (window.__TAVERNA_GAME__) {
      window.__TAVERNA_GAME__.scene.getScenes(true)[0].scene.start('WorldScene', { playerClass: 'PALADIN', hasSave: false });
    }
  });

  console.log('Waiting 5 seconds for WorldScene to load and crash...');
  await page.waitForTimeout(5000);
  
  console.log('Closing browser...');
  await browser.close();
})();
