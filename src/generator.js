import puppeteer from 'puppeteer-core';

/**
 * Class managing document generation.
 */
class Generator {
  #chromiumPath = process.env.CHROMIUM_PATH;
  #browser;

  /**
   * Generate the document from an URL.
   *
   * @param {String} url Url to load.
   * @param {String} type Type of document to render (png / pdf).
   * @param {Object} pageOptions Options passed to page.screenshot() or page.pdf().
   * @param {CallableFunction} scenario Scenario to play before rendering the document.
   * @returns {Promise<*>}
   */
  async fromUrl(url, type, pageOptions, scenario) {
    await this._getBrowser();

    const page = await this.#browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle0' });

    return await this._process(page, type, pageOptions, scenario);
  }

  /**
   * Generate a document from HTML code.
   *
   * @param {String} html The HTML code to use. It can be encoded in base64, cf. "decode" argument.
   * @param {Boolean} decode Should the HTML be base64 decoded?
   * @param {String} type Type of document to render (png / pdf).
   * @param {Object} pageOptions Options passed to page.screenshot() or page.pdf().
   * @param {CallableFunction} scenario Scenario to play before rendering the document.
   * @returns {Promise<*>}
   */
  async fromHtml(html, decode, type, pageOptions, scenario) {
    await this._getBrowser();

    const page = await this.#browser.newPage();

    if (decode) {
      const buffer = Buffer.from(html, 'base64');
      html = buffer.toString();
    }

    await page.setContent(html, { waitUntil: 'networkidle0' });

    return await this._process(page, type, pageOptions, scenario);
  }

  /**
   * Launch the puppeteer browser.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _getBrowser() {
    this.#browser = await puppeteer.launch({
      headless: true,
      executablePath: this.#chromiumPath,
      args: ['--disable-dev-shm-usage'],
    });
  }

  /**
   * Process the document generation.
   *
   * @param {Puppeteer.Page} page Puppeteer page used to generate the document.
   * @param {String} type Type of document to render (png / pdf).
   * @param {Object} pageOptions Options passed to page.screenshot() or page.pdf().
   * @param {CallableFunction} scenario Scenario to play before rendering the document.
   * @returns {Promise<*>}
   * @private
   */
  async _process(page, type, pageOptions, scenario) {
    if ('png' === type) {
      // set a default viewport, the scenario can override it.
      await page.setViewport({
        width: 1024,
        height: 768,
      });
    }

    if ('function' === typeof scenario) {
      await scenario(page);
    }

    let buffer;

    if ('png' === type) {
      // take a screenshot
      const options = Object.assign({}, { fullPage: true }, pageOptions);
      buffer = await page.screenshot(options);
    } else {
      // make a PDF
      const options = Object.assign({}, { format: 'A4' }, pageOptions);
      buffer = await page.pdf(options);
    }

    await this.#browser.close();

    return buffer;
  }
}

export default new Generator();
