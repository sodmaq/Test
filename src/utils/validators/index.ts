import Joi, { ValidationOptions } from "joi";

export const validationOption: ValidationOptions = {
  errors: {
    wrap: {
      label: "",
    },
  },
  abortEarly: false,
};

export const passwordPattern =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const phoneNumberPattern =
  /^(\+?\d{1,4}\s?)?\(?\d{1,6}\)?[-.\s]?\d{1,15}$/;

export const nullableFields = ["", null];
