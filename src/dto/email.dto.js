import Joi from "joi";

const emailSchemaDto = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } }) 
        .required()
        .messages({
            "string.base": `"Email" debe ser un tipo de texto`,
            "string.email": `"Email" debe ser un correo electrónico válido`,
            "any.required": `"Email" es un campo requerido`,
        }),
});

export default emailSchemaDto;

