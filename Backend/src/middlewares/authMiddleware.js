const jwt = require("jsonwebtoken");
const blacklistTokenModel = require("../models/blacklistTokenModel");

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const match = authHeader.match(/^bearer\s+(.+)$/i);

    if (match) {
      return match[1].trim();
    }
  }

  return req.cookies?.token;
}

module.exports.authMiddleware = async function (req, res, next) {
  const token = getTokenFromRequest(req);
  console.log("token: ", token);
  if (!token) {
    return res.status(401).json({
      message: "Token is not provided ",
    });
  }

  const isTokenBlacklisted = await blacklistTokenModel.findOne({
    token: token,
  });
  if (isTokenBlacklisted) {
    return res.status(401).json({
      message: "Token is Invalid",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Token is not valid",
    });
  }
};
