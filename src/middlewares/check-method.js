module.exports = async (req, res, next) => {
  if ('post' !== req.method.toLowerCase()) {
    res.writeHead(500);
    res.end('Bad method');

    next(new Error('Bad method'));
  } else {
    next();
  }
};
