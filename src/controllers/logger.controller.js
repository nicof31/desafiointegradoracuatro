import { EnumErrors, EnumSuccess, HttpResponse } from "../middleware/error-rta/error-layer-rta.js";

class LoggerController {
    constructor(){
        this.httpResponse = new HttpResponse();
    }

    getLogs = async (req, res) => {
        try {
            req.logger.fatal(`FATAL => ${new Date()} - LoggerType: fatal`);
            req.logger.error(`ERROR => ${new Date()} - LoggerType: error`);
            req.logger.warning(`WARNING => ${new Date()} - LoggerType: warning`);
            req.logger.info(`INFO => ${new Date()} - LoggerType: info`);
            req.logger.http(`HTTP => ${new Date()} - LoggerType: http`);
            req.logger.debug(`DEBUG => ${new Date()} - LoggerType: debug`);
            return this.httpResponse.OK(res, `${EnumSuccess.SUCCESS}`, `Log view test`);        
        } catch (error) {
            return this.httpResponse.NotFound(
                res,
                `${EnumErrors.BADREQUEST_ERROR} -  Error in getLogs `, 
            { error: `${error}` }
            ); 
        }
    };

}


export default LoggerController;
