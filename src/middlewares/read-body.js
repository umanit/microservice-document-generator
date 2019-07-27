module.exports = async (req, res, next) => {
  if ('application/json' === req.headers['content-type']) {
    const body = [];

    req.on('data', chunk => body.push(chunk));

    req.on('end', async () => {
      req.body = Buffer.concat(body).toString();

      next();
    });
  } else {
    next();
  }
};
