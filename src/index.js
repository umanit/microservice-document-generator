import '@babel/polyfill';

import http from 'http';
import connect from 'connect';
import path from 'path';
import fs from 'fs';
import checkMethod from './middlewares/check-method';
import generate from './middlewares/generate';
import errorHandling from './middlewares/error-handling';

if (!process.env.CHROMIUM_PATH) {
  throw new Error('The env variable CHROMIUM_PATH is required.');
}

const PORT = process.env.PORT || 1337;

const app = connect();

// Load custom middlewares
try {
  const directoryPath = path.join(__dirname, 'middlewares', 'custom');

  const files = fs.readdirSync(directoryPath);

  files.forEach(file => {
    if ('.js' !== path.extname(file)) {
      return;
    }

    app.use(require(path.join(directoryPath, file)));
  });
} catch (err) {
  throw new Error('Error while adding custom middlewares: ' + err);
}

// Load service middlewares
app.use(checkMethod);
app.use(generate);
app.use(errorHandling);

const server = http.createServer(app);

console.log(`Server listening on port ${PORT}...`);

server.listen(PORT);
