import MessagesService from "../services/messages.service.js";
import { EnumErrors, EnumSuccess, ErrorLevels, HttpResponse } from "../middleware/error-rta/error-layer-rta.js"

class MessagesController {
    constructor(){
       this.messagesService = new MessagesService();
       this.httpResponse = new HttpResponse();
    }

    sendMessages = async (req,res) => {
        try {
            const sendNewMessages  = await this.messagesService.sendMessages(req);
            return this.httpResponse.Create(res, `${EnumSuccess.SUCCESS}`, {sendNewMessages});    
            } catch(error) {
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
        };
    }

    getMessages = async (req,res) => {
        try {
            const userEmail = req.user.email; 
            const getMessages  = await this.messagesService.getMessages(userEmail);
            return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, {getMessages});        
            } catch(error) {
            const errorCode = EnumErrors.DATABASE_ERROR;
                req.logger[ErrorLevels[errorCode] || "error"](
                `${errorCode} - No se pudo obtener los mensajes en la base de datos: ${error}`,
                {
                    errorCode,
                    errorStack: error.stack,
                }
            );         
            return this.httpResponse.NotFound(
                res,
                `${EnumErrors.DATABASE_ERROR} -  No se pudo obtener los carts en la base de datos `, 
                { error: `${error}` }
                );   
            }
    }

}


export default MessagesController;