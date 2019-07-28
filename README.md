# Microservice document generator

Microservice document generator is a NodeJS microservice which allows to generate png or PDF file from an URL or a
HTML string using Puppeteer.

## Installation and launch

1. Install the library

    ```bash
    # npm
    npm install umanit/microservice-document-generator

    # yarn
    yarn add umanit/microservice-document-generator
    ```

1. Manually install a Chromium/Chrome binary. This service use `puppeteer-core` which **DOES NOT** automatically
install a local binary.

1. Define the environment variable `CHROMIUM_PATH` which points to the location of the Chromium/Chrome binary.

1. (Optional) Define the environment variable `ENCRYPTION_KEY` to use `/encrypted` endpoint (see below); Must be 256
bits (32 characters).

1. (Optional) Define the environment variable `PORT` to specify the server port, default to `1337`.

1. (Optional) Define the environment variable `MAX_CONCURRENCY` to specify maximal number of parallel workers
(default 2).

1. (Optional) Define the environment variable `MONITOR_CLUSTER` to `true` to monitor the cluster.

1. Launch the server:

    ```bash
    # npm
    npm start

    # yarn
    yarn start
    ```

## Usage

### Uncrypted data

The microservice exposes a `/` endpoint wich expects clear data that should be call as POST method with parameters
passed as a JSON body. The `Content-Type` must be `application/json`.

```bash
curl -X POST \
  http://127.0.0.1:1337 \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "png",
    "url": "http://www.google.com"
}' \
  -o google.png
```

### Crypted data

The microservice exposes a `/encrypted` endpoint wich expects encrypted data that should be call as POST method
with parameters encrypted message passed as a plain text body. The `Content-Type` must be `text/plain`.

```bash
curl -X POST \
  http://127.0.0.1:1337/encrypted \
  -H 'Content-Type: text/plain' \
  -d '9db37437cd8b889f22ffa454bccbcb8a:5e62b34ab949e4533814bee6cb432fd793b94409318a510b52f9b0032e7461aa834b024cd6cbe5e2b5751f5cc15d0b49e5d74c' \
  -o google.png
```

The message should be composed of the IV concatenated with the parameters JSON string separated with a `:`. In the
previous example, the IV is `9db37437cd8b889f22ffa454bccbcb8a` and the encrypted message
`5e62b34ab949e4533814bee6cb432fd793b94409318a510b52f9b0032e7461aa834b024cd6cbe5e2b5751f5cc15d0b49e5d74c`.

Using the `ENCRYPTION_KEY` environment variable and the IV, the message will be decrypted and result used as
parameters for the generation. In the previous example, the result is:

```json
{
    "type": "png",
    "url": "http://www.google.com"
}
```

## Parameters

* `type` is used to specify the type of document to retrieve. There are two supported values : `png` and `pdf`.
* `url` is used when the document should be generated from an existing webpage. Could not be used with `html`.
* `html` is used when the document should be generated from a HTML string (or a base64 encoded string, see `decode`
parameter). Could not be used with `url`.
* (optional) `decode` is used if the given `html` should be base64 decoded before process.
* (optional) `pageOptions` options passed to `page.screenshot()` (for `png` type) or `page.pdf()` (for `pdf` type).
Please refer to the official documentation for more informations: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md
* (optional) `scenario` is used to specify the scenario to play on the page before rendering the document; See below
for more informations.

## Scenarios

A scenario can be played on the page before rendering the document. It consists on an async callback which receives the
Pupeteer page and can interact with it.

The scenario's name given must match an equivalent filename in the `scenarios/` folder. For example, if the parameter
is `"scenario": "red-background"`, the file `scenarios/red-background.js` will be used.

The file should exports itself as a local module. The previous example of "red-background" can be written as following:

```js
module.exports = async page => {
  await page.evaluate(() => {
    document.querySelector('body').style.backgroundColor = 'red';
  });
};
```

## Middlewares

Middlewares are used to modify the request and/or the response before the generation processing. The operation of
middleware is the same as on most frameworks: functions that have access to the request object (`req`), the response
object (`res`), and the `next` function in the application's request-response cycle.

Express documentation is a good source of explanation: https://expressjs.com/en/guide/writing-middleware.html

You can write your own middlewares as for scenarios by creating them in the `middlewares/custom` directory.

Here is an example of the middleware used to verify the request's method and content-type:

```js
module.exports = async (req, res, next) => {
  if ('post' !== req.method.toLowerCase()) {
    res.writeHead(500);
    res.end('Bad method');

    return next(new Error('Bad method'));
  }

  if (!['application/json', 'text/plain'].includes(req.headers['content-type'])) {
    res.writeHead(500);
    res.end('Bad Content-Type');

    return next(new Error('Bad Content-Type'));
  }

  next();
};
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
