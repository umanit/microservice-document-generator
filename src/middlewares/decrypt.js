import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 256 bits (32 characters)

const decrypt = text => {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

module.exports = async (req, res, next) => {
  if (!ENCRYPTION_KEY) {
    res.writeHead(500);
    res.end('Missing encryption key.');

    return next(new Error('The env variable ENCRYPTION_KEY is required.'));
  }

  if ('text/plain' !== req.headers['content-type']) {
    res.writeHead(500);
    res.end('Bad Content-Type');

    return next(new Error('Bad Content-Type'));
  }

  const body = [];

  req.on('data', chunk => body.push(chunk));

  req.on('end', async () => {
    req.body = decrypt(Buffer.concat(body).toString());

    next();
  });
};
