const { Prisma } = require("@prisma/client");
const { AuthError } = require("../services/auth.service");

function errorHandler(error, req, res, next) {
  if (error instanceof AuthError) {
    if (error.code === "INVALID_CREDENTIALS") {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (error.code === "ACCOUNT_EXISTS") {
      return res.status(409).json({ message: "Unable to create account." });
    }
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return res.status(409).json({ message: "Unable to create account." });
  }

  return res.status(500).json({ message: "Something went wrong. Please try again." });
}

module.exports = errorHandler;