const Joi = require("joi");

const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().max(255).required(),
  password: Joi.string().min(8).max(128).required(),
  confirmPassword: Joi.string().required(),
  role: Joi.string().valid("BUYER", "SELLER").required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().max(255).required(),
  password: Joi.string().required(),
});

module.exports = {
  validateSignup: (payload) => signupSchema.validate(payload),
  validateLogin: (payload) => loginSchema.validate(payload),
};