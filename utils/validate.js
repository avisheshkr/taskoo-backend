import Joi from "joi";

const registerSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Enter your fullname",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Enter your email address",
  }),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/
    )
    .message(
      "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character."
    )
    .required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Enter your email address",
  }),
  password: Joi.string()
    .required()
    .messages({ "any.required": "Enter your password" }),
});

const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/
    )
    .message(
      "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character."
    )
    .required(),
  token: Joi.string().required().messages({
    "any.required": "No token provided!",
  }),
});

export const registerValidator = (data) => registerSchema.validate(data);
export const loginValidator = (data) => loginSchema.validate(data);
export const resetPasswordValidator = (data) =>
  resetPasswordSchema.validate(data);
