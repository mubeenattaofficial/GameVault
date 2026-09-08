const { prisma } = require("../db/prisma");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");

const PASSWORD_SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES_IN = "5m";
const REFRESH_TOKEN_EXPIRES_IN_MS = 8 * 60 * 1000;

class AuthError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

async function signup({ name, email, password, role }) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AuthError("ACCOUNT_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  return prisma.user.create({
    data: { name, email, passwordHash, role },
    select: { id: true, name: true, email: true, role: true },
  });
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !passwordMatches || !user.isActive) {
    throw new AuthError("INVALID_CREDENTIALS");
  }

  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

  if (!accessTokenSecret) {
    throw new Error("Missing ACCESS_TOKEN_SECRET environment variable");
  }

  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    accessTokenSecret,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );

  const refreshToken = crypto.randomBytes(48).toString("hex");
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const refreshTokenExpiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      userId: user.id,
      expiresAt: refreshTokenExpiresAt,
    },
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

module.exports = {
  AuthError,
  signup,
  login,
};