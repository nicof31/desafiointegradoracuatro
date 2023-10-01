import Joi from "joi";

const ticketDto = {
    validate: async (ticket) => {
        const ticketSchema = Joi.object({
            amount: Joi.number().min(0).required().messages({
                "number.base": `"Amount" debe ser un número`,
                "number.min": `"Amount" debe ser mayor o igual a 0`,
                "any.required": `"Amount" es un campo requerido`,
            }),
            purchaser: Joi.string().required().messages({
                "string.base": `"Purchaser" debe ser un tipo de texto`,
                "any.required": `"Purchaser" es un campo requerido`,
            }),
        });

        try {
            await ticketSchema.validateAsync(ticket);
            return ticket;
        } catch (error) {
            throw new Error(`Error de validación del ticket: ${error.message}`);
        }
    },
};

export default ticketDto;