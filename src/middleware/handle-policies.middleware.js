import passport from "passport";
import { EnumErrors, EnumSuccess, ErrorLevels, HttpResponse } from "../middleware/error-rta/error-layer-rta.js"


const httpResponse = new HttpResponse();

export default function handlePolicies(roles) {
  return async function (req, res, next) {
    try {
      //Datos del usuario del token JWT
      const userJWT = req.user;
      if (!userJWT || !userJWT.user || !userJWT.user.role) {
        return httpResponse.Unauthorized(
          res,
          `${EnumErrors.UNAUTHORIZED_ERROR}`,
          `Credenciales inválidas`
        );
      }
      const userRole = userJWT.user.role;
      // Verifico si el rol del usuario es permitido
      if (!roles.includes(userRole)) {
        return httpResponse.Forbbiden(
          res,
          `${EnumErrors.FORBIDDEN_ERROR}` ,
          `Credenciales inválidas`
      );
      }
      next();
    } catch (error) {
      const errorCode = EnumErrors.INTERNAL_SERVER_ERROR;
      req.logger[ErrorLevels[errorCode] || "error"](
        `${errorCode} - Error en el middleware handlePolicies ${error}`,
        {
          errorCode,
          errorStack: error.stack,
        }
      );
      return httpResponse.Error(
        res,
        `${EnumErrors.INTERNAL_SERVER_ERROR}` ,
        `Error en el servidor`
    );
    }
  };
}


