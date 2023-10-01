import Joi from "joi";

const currentResponseDto = Joi.object({
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
        .email({ tlds: { allow: false } }) 
        .required()
        .messages({
            "string.base": `"Email" debe ser un tipo de texto`,
            "string.email": `"Email" debe ser un correo electrónico válido`,
            "any.required": `"Email" es un campo requerido`,
        }),
    role: Joi.string()
        .valid("PUBLIC", "USER", "ADMIN") 
        .required()
        .messages({
            "string.base": `"Role" debe ser un tipo de texto`,
            "any.only": `"Role" debe ser uno de los valores permitidos: 'PUBLIC', 'USER', 'ADMIN'`,
            "any.required": `"Role" es un campo requerido`,
        }),
    id: Joi.string()
        .required()
        .messages({
            "string.base": `"ID" debe ser un tipo de texto`,
            "any.required": `"ID" es un campo requerido`,
        }),
    iat: Joi.number()
        .integer()
        .required()
        .messages({
            "number.base": `"IAT" debe ser un número entero`,
            "any.required": `"IAT" es un campo requerido`,
        }),
    exp: Joi.number()
        .integer()
        .required()
        .messages({
            "number.base": `"EXP" debe ser un número entero`,
            "any.required": `"EXP" es un campo requerido`,
        }),
});

export default currentResponseDto;