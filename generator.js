const generator = require('puppeteer');

module.exports = (urlOrHtml, type, scenario) => (async () => {
  const browser = await generator.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();

  // "http" is not the four firth characters, so we guess it's HTML code
  if ('http' !== urlOrHtml.charAt(0) + urlOrHtml.charAt(1) + urlOrHtml.charAt(2) + urlOrHtml.charAt(3)) {
    await page.setContent(urlOrHtml, {waitUntil: 'networkidle0'});
  } else {
    await page.goto(urlOrHtml, {waitUntil: 'networkidle0'});
  }

  if ('function' === typeof scenario) {
    await scenario(page);
  }

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
