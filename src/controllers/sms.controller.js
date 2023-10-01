import SmsService from "../services/sms.service.js";
import { EnumErrors, EnumSuccess, ErrorLevels, HttpResponse } from "../middleware/error-rta/error-layer-rta.js"

class SmsController {
    constructor(){
        this.smsService = new SmsService();
        this.httpResponse = new HttpResponse();
    }

    sendSms = async (req, res) => {
        try {
          const sendNewSms = await this.smsService.sendSms(req);
          return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, `sms send to ${req.body.phone}`);        
        } catch (error) {
          const errorCode = EnumErrors.DATABASE_ERROR;
          req.logger[ErrorLevels[errorCode] || "error"](
            `${errorCode} - Error al procesar la petición POST: ${error}`,
            {
              errorCode,
              errorStack: error.stack,
            }
          );
          return this.httpResponse.NotFound(
            res,
            `${EnumErrors.DATABASE_ERROR} -  Error al procesar la petición POST `, 
          { error: `${error}` }
        ); 
        }
      };

}


export default SmsController;