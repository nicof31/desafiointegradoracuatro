import Joi from "joi";

const smsSchemaDto = Joi.object({
    name: Joi.string()
        .required()
        .messages({
            "string.base": `"Name" debe ser un tipo de texto`,
            "any.required": `"Name" es un campo requerido`,
        }),
    phone: Joi.string()
        .required()
        .pattern(/^\+\d+$/) 
        .messages({
            "string.base": `"Number" debe ser un tipo de texto`,
            "string.pattern.base": `"Number" debe tener el formato correcto (+ número)`,
            "any.required": `"Number" es un campo requerido`,
        }),
});

export default smsSchemaDto;

