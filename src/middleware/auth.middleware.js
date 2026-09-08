const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authorization = req.headers.authorization;
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!accessToken || !process.env.ACCESS_TOKEN_SECRET) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    req.user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication required." });
  }
}

module.exports = authenticate;