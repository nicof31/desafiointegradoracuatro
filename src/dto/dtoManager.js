import productSchemaDto from "./product.dto.js";
import { userSchemaDto, recoverSchemaDto } from "./session.dto.js";
import emailSchemaDto from "./email.dto.js";
import smsSchemaDto from "./sms.dto.js";
import currentResponseDto from "./currentRta.dto.js";
import ticketDto from "./ticket.dto.js";


const PRODUCT_DTO =  productSchemaDto;
const SESSION_REGISTER_DTO =  userSchemaDto ;
const SESSION_RECOVER_DTO =  recoverSchemaDto ;
const EMAIL_DTO = emailSchemaDto;
const SMS_DTO = smsSchemaDto;
const CURRENT_DTO = currentResponseDto;
const TICKET_DTO = ticketDto;

export { PRODUCT_DTO, SESSION_REGISTER_DTO, SESSION_RECOVER_DTO, EMAIL_DTO, SMS_DTO, CURRENT_DTO, TICKET_DTO };
