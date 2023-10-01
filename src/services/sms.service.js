import twilio from "twilio";
import { appConfig } from "../config/config.js";
const { SMS_ACC_SID, SMS_AUTH_TOKEN, SMS_PHONE } = appConfig;

class SmsService { 
    constructor(){
    }

    sendSms = async (req) => {
        try {
          const client = twilio(SMS_ACC_SID, SMS_AUTH_TOKEN);
          let result = await client.messages.create({
            body: `Bienvenido ${req.body.name} a la plataforma Ecommerce, esperamos que tengas una grata experiencia`,
            from: SMS_PHONE,
            to: req.body.phone,
          });
          console.log("🚀 ~ file: sms.routes.js:16 ~  ~ result:", result);
          return result;
        } catch (error) {
          console.error(`smsService: Error al procesar la petición POST: ${error}`);
          throw error;
        }
      };
    
}


export default SmsService;
