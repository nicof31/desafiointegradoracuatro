import { EnumErrors, EnumSuccess, HttpResponse } from "../middleware/error-rta/error-layer-rta.js"

const httpResponse = new HttpResponse();

const validatePersistence = (req, res, next) => {
    const { PERSISTENCE } = process.env;
    if (PERSISTENCE !== "DEVELOPER") {
    return httpResponse.Forbbiden(
        res,
        `${EnumErrors.FORBIDDEN_ERROR}` ,
        `Credenciales inválidas`
    );
}
    next();
};

export default validatePersistence;
