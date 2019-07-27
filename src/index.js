import 'core-js/stable';
import 'regenerator-runtime/runtime';

import http from 'http';
import connect from 'connect';
import path from 'path';
import fs from 'fs';
import checkRequest from './middlewares/check-request';
import decrypt from './middlewares/decrypt';
import readBody from './middlewares/read-body';
import generate from './middlewares/generate';
import errorHandling from './middlewares/error-handling';
import generator from './generator';

(async () => {
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

  await generator.initCluster();

  // Load service middlewares
  app.use(checkRequest);
  app.use(readBody);
  app.use('/encrypted', decrypt);
  app.use(generate);
  app.use(errorHandling);

  const server = http.createServer(app);

  console.log(`Server listening on port ${PORT}...`);

  server.listen(PORT);
})();
