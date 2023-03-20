import puppeteer from 'puppeteer-core';
import { Cluster } from 'puppeteer-cluster';

/**
 * Class managing document generation.
 */
class Generator {
  #chromiumPath = process.env.CHROMIUM_PATH;
  #cluster;

  /**
   * Init the cluster of Puppeteer.
   *
   * @returns {Promise<void>}
   */
  async initCluster() {
    let maxConcurrency = 2;

    if (process.env.MAX_CONCURRENCY) {
      maxConcurrency = parseInt(process.env.MAX_CONCURRENCY, 10);
    }

    this.#cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_BROWSER,
      maxConcurrency: maxConcurrency,
      monitor: process.env.MONITOR_CLUSTER || false,
      puppeteer,
      puppeteerOptions: {
        headless: true,
        executablePath: this.#chromiumPath,
        args: ['--disable-dev-shm-usage'],
      },
    });
  }

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
    return await this.#cluster.execute({
      url,
      type,
      pageOptions,
      scenario,
    }, async ({ page, data: { url, type, pageOptions, scenario } }) => {
      await page.goto(url, { waitUntil: 'networkidle0' });

      return await Generator._process(page, type, pageOptions, scenario);
    });
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
    if (decode) {
      const buffer = Buffer.from(html, 'base64');
      html = buffer.toString();
    }

    return await this.#cluster.execute({
      html,
      type,
      pageOptions,
      scenario,
    }, async ({ page, data: { html, type, pageOptions, scenario } }) => {
      await page.setContent(html, { waitUntil: 'networkidle0' });

      return await Generator._process(page, type, pageOptions, scenario);
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
  static async _process(page, type, pageOptions, scenario) {
    if ('png' === type) {
      // set a default viewport for png, the scenario can override it.
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

    return buffer;
  }
}

export default new Generator();
