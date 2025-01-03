import Joi, { ValidationResult } from "joi";
import { passwordPattern, phoneNumberPattern, validationOption } from ".";
import { Request } from "express";

class UserValidatorUtil {
  private validatorOption = validationOption;

  public createSchema = (req: Request): ValidationResult => {
    const schema = Joi.object().keys({
      fullname: Joi.string().required().label("Full Name"),
      username: Joi.string().required().label("Full Name"),
      email: Joi.string().email().required().label("Email"),
      phoneNumber: Joi.string()
        .regex(phoneNumberPattern)
        .required()
        .messages({
          "string.pattern.base": "Invalid phone number",
        })
        .label("Phone Number"),
    });

    return schema.validate(req.body, this.validatorOption);
  };

  public registerSchema = (req: Request): ValidationResult => {
    const schema = Joi.object().keys({
      fullname: Joi.string().required().label("Full Name").messages({
        "string.empty": "Full Name is required.",
        "any.required": "Full Name is required.",
      }),
      email: Joi.string().email().required().label("Email").messages({
        "string.empty": "Email is required.",
        "any.required": "Email is required.",
      }),
      password: Joi.string()
        .min(8)
        .regex(passwordPattern)
        .required()
        .messages({
          "string.empty": "Password is required.",
          "any.required": "Password is required.",
          "string.pattern.base":
            "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.",
        })
        .label("Password"),
      phoneNumber: Joi.string()
        .allow("")
        .regex(phoneNumberPattern)
        .messages({
          "string.pattern.base": "Invalid phone number.",
        })
        .label("Phone Number"),
      username: Joi.string().allow(""),
      bio: Joi.string().allow(""),
      linkedIn: Joi.string().allow(""),
      facebook: Joi.string().allow(""),
      instagram: Joi.string().allow(""),
      avatar: Joi.string().allow(""),
      x: Joi.string().allow(""),
    });

    return schema.validate(req.body, this.validatorOption);
  };
  public loginSchema = (req: Request): ValidationResult => {
    const schema = Joi.object().keys({
      email: Joi.string().email().required().label("Email"),
      password: Joi.string()
        .min(8)
        .regex(passwordPattern)
        .required()
        .messages({
          "string.pattern.base":
            "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.",
        })
        .label("Password"),
    });

    return schema.validate(req.body, this.validatorOption);
  };

  public forgotPasswordSchema = (req: Request): ValidationResult => {
    const schema = Joi.object().keys({
      email: Joi.string().email().required().label("Email"),
    });

    return schema.validate(req.body, this.validatorOption);
  };

  public refreshSchema = (req: Request): ValidationResult => {
    const schema = Joi.object().keys({
      refreshToken: Joi.string().required().label("Refresh Token").messages({
        "string.empty": "Refresh Token is required.",
        "any.required": "Refresh Token is required.",
      }),
    });
    return schema.validate(req.body, this.validatorOption);
  };

  public changePasswordSchema = (req: Request): ValidationResult => {
    const schema = Joi.object().keys({
      old_password: Joi.string()
        .label("Old Password")
        .min(8)
        .required()
        .messages({
          "string.empty": "Old Password is required.",
          "any.required": "Old Password is required.",
          "string.min": "Old Password must be at least 8 characters long.",
        }),
      new_password: Joi.string()
        .label("Password")
        .min(8)
        .regex(passwordPattern)
        .required()
        .messages({
          "string.empty": "New Password is required.",
          "any.required": "New Password is required.",
          "string.min": "New Password must be at least 8 characters long.",
          "string.pattern.base":
            "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.",
        }),
      confirm_new_password: Joi.string()
        .label("Confirm New Password")
        .min(8)
        .regex(passwordPattern)
        .required()
        .valid(Joi.ref("new_password"))
        .messages({
          "string.empty": "Confirm Password is required.",
          "any.required": "Confirm Password is required.",
          "any.only": "Your passwords don't match. Please try again.",
          "string.min": "Password must be at least 8 characters long.",
          "string.pattern.base":
            "Confirm Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.",
        }),
    });

    return schema.validate(req.body, this.validatorOption);
  };

  public resetPasswordSchema = (req: Request): ValidationResult => {
    const schema = Joi.object().keys({
      otpCode: Joi.string().required().label("OTP Code").messages({
        "string.empty": "OTP Code is required.",
        "any.required": "OTP Code is required.",
      }),
      new_password: Joi.string()
        .label("New Password")
        .min(8)
        .regex(passwordPattern)
        .required()
        .messages({
          "string.empty": "New Password is required.",
          "any.required": "New Password is required.",
          "string.min": "Password must be at least 8 characters long.",
          "string.pattern.base":
            "New Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.",
        }),
      confirm_new_password: Joi.string()
        .label("Confirm New Password")
        .min(8)
        .regex(passwordPattern)
        .required()
        .valid(Joi.ref("new_password"))
        .messages({
          "string.empty": "Confirm Password is required.",
          "any.required": "Confirm Password is required.",
          "any.only": "Your passwords don't match. Please try again.",
          "string.min": "Password must be at least 8 characters long.",
          "string.pattern.base":
            "Confirm Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.",
        }),
    });

    return schema.validate(req.body, this.validatorOption);
  };
}

export default new UserValidatorUtil();
