const http = require('http');
const url = require('url');
const generator = require('./generator');

const server = http.createServer(async (req, res) => {
  const queryData = url.parse(req.url, true).query;

  if (!queryData.url) {
    res.writeHead(500);
    res.end('URL is missing.');

    return;
  }

  const type = queryData.type || 'png';

  try {
    const buffer = await generator(queryData.url, type);
    const contentType = 'png' === type ? 'image/png' : 'application/pdf';

    res.writeHead(200, {'Content-Type': contentType});
    res.end(buffer);
  } catch (e) {
    res.writeHead(500);
    res.end(e.message);
  }
});

server.listen(3000);
