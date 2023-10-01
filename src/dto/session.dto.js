import Joi from "joi";

const userSchemaDto = Joi.object({
    first_name: Joi.string()
        .required()
        .messages({
            "string.base": `"First Name" debe ser un tipo de texto`,
            "any.required": `"First Name" es un campo requerido`,
        }),
    last_name: Joi.string()
        .required()
        .messages({
            "string.base": `"Last Name" debe ser un tipo de texto`,
            "any.required": `"Last Name" es un campo requerido`,
        }),
    email: Joi.string()
        .email({ tlds: { allow: false } }) // Validar el formato de correo electrónico
        .required()
        .messages({
            "string.base": `"Email" debe ser un tipo de texto`,
            "string.email": `"Email" debe ser un correo electrónico válido`,
            "any.required": `"Email" es un campo requerido`,
        }),
    age: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            "number.base": `"Age" debe ser un número entero`,
            "number.min": `"Age" debe ser mayor o igual a 0`,
            "any.required": `"Age" es un campo requerido`,
        }),
    password: Joi.string()
        .required()
        .messages({
            "string.base": `"Password" debe ser un tipo de texto`,
            "any.required": `"Password" es un campo requerido`,
        }),
    role: Joi.string()
        .uppercase()
        .valid("PUBLIC", "USER", "ADMIN","PREMIUM")
        .required()
        .messages({
            "string.base": `"Role" debe ser un tipo de texto`,
            "any.only": `"Role" debe ser uno de los valores permitidos: 'PUBLIC', 'USER', 'ADMIN', 'PREMIUM`,
            "any.required": `"Role" es un campo requerido`,
    }),
});

const recoverSchemaDto = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } }) // Validar el formato de correo electrónico
        .required()
        .messages({
            "string.base": `"Email" debe ser un tipo de texto`,
            "string.email": `"Email" debe ser un correo electrónico válido`,
            "any.required": `"Email" es un campo requerido`,
        }),
    new_password: Joi.string()
        .required()
        .messages({
            "string.base": `"Password" debe ser un tipo de texto`,
            "any.required": `"Password" es un campo requerido`,
        }),
});


export  {userSchemaDto, recoverSchemaDto};
