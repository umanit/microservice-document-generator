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
