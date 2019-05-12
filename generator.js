const generator = require('puppeteer');

module.exports = (url, type) => (async () => {
  if ('png' !== type && 'pdf' !== type) {
    throw new Error('Invalid type "' + type + '", must be "png" or "pdf".');
  }

  const browser = await generator.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle0'});

  const checkboxSelector = 'label[for="confirmLegals"]';
  await page.waitFor(checkboxSelector);
  await page.click(checkboxSelector);
  await page.waitFor(300);

  let buffer;

  if ('png' === type) {
    // take a screenshot
    page.setViewport({
      width: 1024,
      height: 768,
    });

    buffer = await page.screenshot({fullpage: true});
  } else {
    // make a PDF
    buffer = await page.pdf({format: 'A4'});
  }

  await browser.close();

  return buffer;
})();
