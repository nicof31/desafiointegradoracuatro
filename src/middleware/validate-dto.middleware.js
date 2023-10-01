import { EnumErrors, EnumSuccess, HttpResponse } from "../middleware/error-rta/error-layer-rta.js"

const httpResponse = new HttpResponse();

function validateSchema(schema) {
  return (req, res, next) => {
    const bodyDto = req.body;
    const { error } = schema.validate(bodyDto, { abortEarly: false });
    if (error) {
      const validationError = error.details.map((detail) => {
        return detail.message;
      });
     return httpResponse.BadRequest(
        res,
        `${EnumErrors.VALIDATION_ERROR}`,
        {error: validationError}
    );
    }
    next();
  };
}

export default validateSchema;
