import Joi from 'joi';

export const createFieldValidationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'El nombre debe ser un texto',
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no debe exceder 100 caracteres',
      'any.required': 'El nombre es requerido'
    }),

  type: Joi.string()
    .valid('CANCHA 5', 'CANCHA 7', 'CANCHA 11', 'PADEL')
    .required()
    .messages({
      'string.base': 'El tipo debe ser un texto',
      'string.empty': 'El tipo es requerido',
      'any.only': 'El tipo debe ser: CANCHA 5, CANCHA 7, CANCHA 11',
      'any.required': 'El tipo es requerido'
    }),

  pricePerHour: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'El precio por hora debe ser un número',
      'number.positive': 'El precio por hora debe ser positivo',
      'any.required': 'El precio por hora es requerido'
    }),

  isActive: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'El estado debe ser verdadero o falso',
      'any.required': 'El estado es requerido',
    })
});

export const updateFieldValidationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .messages({
      'string.base': 'El nombre debe ser un texto',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no debe exceder 100 caracteres'
    }),

  type: Joi.string()
    .valid('CANCHA 5', 'CANCHA 7', 'CANCHA 11', 'PADEL')
    .messages({
      'string.base': 'El tipo debe ser un texto',
      'any.only': 'El tipo debe ser: CANCHA 5, CANCHA 7, CANCHA 11 o PADEL'
    }),

  pricePerHour: Joi.number()
    .positive()
    .precision(2)
    .messages({
      'number.base': 'El precio por hora debe ser un número',
      'number.positive': 'El precio por hora debe ser positivo'
    }),

  isActive: Joi.boolean()
    .messages({
      'boolean.base': 'El estado debe ser verdadero o falso'
    })
}).min(1).messages({
  'object.min': 'Al menos un campo debe ser proporcionado para actualizar'
});
