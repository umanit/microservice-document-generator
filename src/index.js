import '@babel/polyfill';

import http from 'http';
import connect from 'connect';
import checkMethod from './middlewares/check-method';
import generate from './middlewares/generate';
import errorHandling from './middlewares/error-handling';

if (!process.env.CHROMIUM_PATH) {
  throw new Error('The env variable CHROMIUM_PATH is required.');
}

const PORT = process.env.PORT || 1337;

const app = connect();

app.use(checkMethod);
app.use(generate);
app.use(errorHandling);

const server = http.createServer(app);

console.log(`Server listening on port ${PORT}...`);

server.listen(PORT);
