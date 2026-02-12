import Joi from "joi"

export const bookingValidationSchema = Joi.object({
  field: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": "La cancha debe ser un texto",
      "string.empty": "La cancha es requerida",
      "any.required": "La cancha es requerida",
    }),
  client: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.base": "El cliente debe ser un texto",
      "string.empty": "El cliente es requerido",
      "string.min": "El cliente debe tener al menos 2 caracteres",
      "string.max": "El cliente no debe exceder 100 caracteres",
      "any.required": "El cliente es requerido",
    }),
  tel: Joi.string()
    .trim()
    .pattern(/^[0-9]{7,15}$/)
    .required()
    .messages({
      "string.base": "El teléfono debe ser un texto",
      "string.empty": "El teléfono es requerido",
      "string.pattern.base": "El teléfono debe contener entre 7 y 15 dígitos",
      "any.required": "El teléfono es requerido",
    }),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.base": "La fecha debe ser un texto",
      "string.pattern.base": "La fecha debe tener el formato AAAA-MM-DD",
      "any.required": "La fecha es requerida",
    }),
  startTime: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.base": "El horario debe ser un texto",
      "string.pattern.base": "El horario debe tener el formato HH:MM",
      "any.required": "El horario es requerido",
    }),
  endTime: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      "string.pattern.base": "El horario de fin debe tener el formato HH:MM",
    }),
  status: Joi.string()
    .valid("Confirmada", "Pendiente", "Cancelada")
    .required()
    .messages({
      "string.base": "El estado debe ser un texto",
      "any.only": "El estado debe ser Confirmada, Pendiente o Cancelada",
      "any.required": "El estado es requerido",
    }),
})
