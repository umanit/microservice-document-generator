# WIP

# Microservice generator

Microservice generator is a NodeJS microservice which allows to generate png or PDF file from an URL or a HTML string.

## Installation

```bash
# npm
npm install umanit/microservice-generator

# yarn
yarn add umanit/microservice-generator
```

## Usage

```bash
curl -X POST \
  http://127.0.0.1:1337 \
  -H 'Content-Type: application/json' \
  -d '{
	"type": "png",
	"url": "http://www.perdu.com"
}'
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
