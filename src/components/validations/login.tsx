import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "El correo electrónico es requerido",
      "string.email": "Ingresa un correo electrónico válido",
      "any.required": "El correo electrónico es requerido",
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.empty": "La contraseña es requerida",
      "string.min": "La contraseña debe tener al menos 6 caracteres",
      "any.required": "La contraseña es requerida",
    }),
});
