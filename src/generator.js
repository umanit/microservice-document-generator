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
   * @param {String} type Type of document to render (png / pdf)
   * @param {CallableFunction} scenario Scenario to play before rendering the document.
   * @returns {Promise<*>}
   */
  async fromUrl(url, type, scenario) {
    await this._getBrowser();

    const page = await this.#browser.newPage();

    await page.goto(url, {waitUntil: 'networkidle0'});

    return await this._process(page, type, scenario);
  }

  /**
   * Generate a document from HTML code.
   *
   * @param {String} html The HTML code to use. It can be encoded in base64, cf. "decode" argument.
   * @param {Boolean} decode Should the HTML be base64 decoded?
   * @param {String} type Type of document to render (png / pdf)
   * @param {CallableFunction} scenario Scenario to play before rendering the document.
   * @returns {Promise<*>}
   */
  async fromHtml(html, decode, type, scenario) {
    await this._getBrowser();

    const page = await this.#browser.newPage();

    if (decode) {
      const buffer = Buffer.from(html, 'base64');
      html = buffer.toString();
    }

    await page.setContent(html, {waitUntil: 'networkidle0'});

    return await this._process(page, type, scenario);
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
   * @param page
   * @param type
   * @param scenario
   * @returns {Promise<*>}
   * @private
   */
  async _process(page, type, scenario) {
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
      buffer = await page.screenshot({fullpage: true});
    } else {
      // make a PDF
      buffer = await page.pdf({format: 'A4'});
    }

    await this.#browser.close();

    return buffer;
  }
}

export default new Generator();
