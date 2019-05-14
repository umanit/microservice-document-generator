import '@babel/polyfill';

import http from 'http';
import path from 'path';
import fs from 'fs';

import generator from './generator';

if (!process.env.CHROMIUM_PATH) {
  throw new Error('The env variable CHROMIUM_PATH is required.');
}

const PORT = process.env.PORT || 1337;

const server = http.createServer(async (req, res) => {
  if ('post' !== req.method.toLowerCase()) {
    res.writeHead(500);
    res.end('Bad method');

    return;
  }

  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const {url, html, type, scenario} = JSON.parse(body);

      if (!type) {
        throw new Error('The parameter "type" is required.');
      }

      if ('png' !== type && 'pdf' !== type) {
        throw new Error('Invalid type "' + type + '", must be "png" or "pdf".');
      }

      if ((!url && !html) || (url && html)) {
        throw new Error('Either "url" or "html" must be passed, not both.');
      }

      let scenarioCallback;

      // check scenario existence if passed
      if (scenario) {
        const filePath = path.join(__dirname, 'scenarios', scenario.trim() + '.js');

        try {
          await fs.promises.access(filePath);

          scenarioCallback = require(filePath);
        } catch (e) {
          throw new Error('Unknown scenario.');
        }
      }

      const buffer = await generator(url || html, type, scenarioCallback);
      const contentType = 'png' === type ? 'image/png' : 'application/pdf';

      res.writeHead(200, {'Content-Type': contentType});
      res.end(buffer);
    } catch (e) {
      res.writeHead(500);
      res.end(e.message);
    }
  });
});

console.log('Server listening on port ' + PORT + '...');

server.listen(PORT);
