const http = require('http');
const generator = require('./generator');

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
      const {url, html, type, ...params} = JSON.parse(body);

      if (!type) {
        throw new Error('The parameter "type" is required.');
      }

      if ('png' !== type && 'pdf' !== type) {
        throw new Error('Invalid type "' + type + '", must be "png" or "pdf".');
      }

      if ((!url && !html) || (url && html)) {
        throw new Error('Either "url" or "html" must be passed, not both.');
      }

      const buffer = await generator(url || html, type);
      const contentType = 'png' === type ? 'image/png' : 'application/pdf';

      res.writeHead(200, {'Content-Type': contentType});
      res.end(buffer);
    } catch (e) {
      res.writeHead(500);
      res.end(e.message);
    }
  });
});

server.listen(3000);
