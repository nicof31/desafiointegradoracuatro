import { isValidObjectId } from "mongoose";
import { EnumErrors, EnumSuccess, HttpResponse } from "../middleware/error-rta/error-layer-rta.js"

const httpResponse = new HttpResponse();

const isValidMongoId = (paramsId) => {
  return (req, res, next) => {
    const urlId = req.params[`${paramsId}`];
    const url = req.originalUrl;
    if (!isValidObjectId(urlId)) {
      return httpResponse.BadRequest(
        res,
        `${EnumErrors.BADREQUEST_ERROR}`,
        `${url}`
      );
   
    }
    next();
  };
};

export default isValidMongoId;
