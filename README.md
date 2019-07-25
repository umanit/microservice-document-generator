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

1. (Optional) Define the environment variable `PORT` to specify the server port, default to `1337`.

1. Launch the server:

    ```bash
    # npm
    npm start

    # yarn
    yarn start
    ```

## Usage

The microservice exposes only one endpoint and it should be call with a POST method and parameters are passed as a
JSON body.

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

## Parameters

* `type` is used to specify the type of document to retrieve. There are two supported values : `png` and `pdf`.
* `url` is used when the document should be generated from an existing webpage. Could not be used with `html`.
* `html` is used when the document should be generated from a HTML string (or a base64 encoded string, see `decode`
parameter). Could not be used with `url`.
* (optional) `decode` is used if the given `html` should be base64 decoded before process.
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

Here is an example of middleware used to catch errors:

```js
module.exports = async (err, req, res, next) => {
  if ('development' === process.env.NODE_ENV) {
    console.error(err);
  }

  res.writeHead(500);
  res.end(err.message);

  next();
};
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
