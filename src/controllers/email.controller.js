import EmailService from "../services/email.service.js";
import { EnumErrors, EnumSuccess, ErrorLevels , HttpResponse } from "../middleware/error-rta/error-layer-rta.js"

class EmailController {
    constructor(){
        this.emailService = new EmailService();
        this.httpResponse = new HttpResponse();
    }

    sendEmail = async (req, res) => {
        try {
          const sendNewEmail = await this.emailService.sendEmail(req);
          return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, `email send to ${req.body.email}`);        
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


export default EmailController;