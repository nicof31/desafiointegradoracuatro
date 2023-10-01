import Joi from "joi";

const productSchemaDto = Joi.object({
    title: Joi.string()
      .required()
      .messages({
        "string.base": `"Title" debe ser un tipo de texto`,
        "any.required": `"Title" es un campo requerido`,
      }),
    description: Joi.string().required().messages({
      "string.base": `"Description" debe ser un tipo de texto`,
      "any.required": `"Description" es un campo requerido`,
    }),
    code: Joi.string().required().messages({
      "string.base": `"Code" debe ser un tipo de texto`,
      "any.required": `"Code" es un campo requerido`,
    }),
    price: Joi.number()
      .min(0)
      .required()
      .messages({
        "number.base": `"Price" debe ser un número`,
        "number.min": `"Price" debe ser mayor o igual a 0`,
        "any.required": `"Price" es un campo requerido`,
      }),
    status: Joi.boolean().required().messages({
      "boolean.base": `"Status" debe ser un valor booleano`,
      "any.required": `"Status" es un campo requerido`,
    }),
    category: Joi.string().required().messages({
      "string.base": `"Category" debe ser un tipo de texto`,
      "any.required": `"Category" es un campo requerido`,
    }),
    thumbnail: Joi.array().items(Joi.string()).messages({
      "array.base": `"Thumbnail" debe ser un arreglo`,
    }),
    stock: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        "number.base": `"Stock" debe ser un número entero`,
        "number.min": `"Stock" debe ser mayor o igual a 0`,
        "any.required": `"Stock" es un campo requerido`,
      }),
    //owner: Joi.string().default("ADMIN"), 
  });
  
  export default productSchemaDto;