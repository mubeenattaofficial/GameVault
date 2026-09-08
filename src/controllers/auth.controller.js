const authService = require("../services/auth.service");
const { validateLogin, validateSignup } = require("../validators/auth.validator");

async function signup(req, res, next) {
  const { error, value } = validateSignup(req.body);

  if (error) {
    return res.status(400).json({ message: "Invalid signup data." });
  }

  if (value.password !== value.confirmPassword) {
    return res.status(400).json({ message: "Invalid signup data." });
  }

  try {
    const user = await authService.signup(value);

    return res.status(201).json({
      message: "Account created successfully. Please log in to continue.",
      user,
    });
  } catch (serviceError) {
    return next(serviceError);
  }
}

async function login(req, res, next) {
  const { error, value } = validateLogin(req.body);

  if (error) {
    return res.status(400).json({ message: "Invalid login data." });
  }

  try {
    const result = await authService.login(value);
    return res.status(200).json(result);
  } catch (serviceError) {
    return next(serviceError);
  }
}

module.exports = {
  signup,
  login,
};