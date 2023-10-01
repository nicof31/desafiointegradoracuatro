import { EnumErrors, EnumSuccess, ErrorLevels, HttpResponse } from "../middleware/error-rta/error-layer-rta.js"

const httpResponse = new HttpResponse();

const authorization = (role) => {
    return async (req, res, next) => {
      console.log(
        "🚀 ~ file: authorization.middleware.js:9 ~ return ~ req.user.role:",
        req.user.user
      );
      if (!req.user)  
        return httpResponse.Unauthorized(
          res,
          `${EnumErrors.UNAUTHORIZED_ERROR}`,
          `Credenciales inválidas`
        );
      if (req.user.user.role != role)
        return httpResponse.Forbbiden(
          res,
          `${EnumErrors.FORBIDDEN_ERROR}` ,
          `Credenciales inválidas`
        );
      next();
    };
  };
  
  
export default authorization;
  