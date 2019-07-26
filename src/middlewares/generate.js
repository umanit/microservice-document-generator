import path from 'path';
import pathIsInside from 'path-is-inside';
import fs from 'fs';
import generator from '../generator';

module.exports = async (req, res, next) => {
  let body = '';

  req.on('data', chunk => body += chunk);

  req.on('end', async () => {
    try {
      const { url, html, type, scenario, decode, pageOptions } = JSON.parse(body);

      if (!type) {
        throw new Error('The parameter "type" is required.');
      }

      if ('png' !== type && 'pdf' !== type) {
        throw new Error(`Invalid type "${type}", must be "png" or "pdf".`);
      }

      if ((!url && !html) || (url && html)) {
        throw new Error('Either "url" or "html" must be passed, not both.');
      }

      if (url && decode) {
        throw new Error('"decode" can only occured with "html" parameter.');
      }

      let scenarioCallback;

      // check scenario existence if passed
      if (scenario) {
        const filePath = path.join(__dirname, 'scenarios', `${scenario.trim()}.js`);

        try {
          if (!pathIsInside(filePath, path.join(__dirname, 'scenarios'))) {
            throw new Error('Unknown scenario.');
          }

          await fs.promises.access(filePath);

          scenarioCallback = require(filePath);
        } catch (e) {
          throw new Error('Unknown scenario.');
        }
      }

      let buffer;

      if (html) {
        buffer = await generator.fromHtml(html, decode, type, pageOptions, scenarioCallback);
      } else {
        buffer = await generator.fromUrl(url, type, pageOptions, scenarioCallback)
      }

      const contentType = 'png' === type ? 'image/png' : 'application/pdf';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(buffer);

      next();
    } catch (e) {
      next(e);
    }
  });
};
