module.exports = async (err, req, res, next) => {
  if ('development' === process.env.NODE_ENV) {
    console.error(err);
  }

  res.writeHead(500);
  res.end(err.message);

  next();
};
