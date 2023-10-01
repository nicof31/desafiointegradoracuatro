import { Router } from "express";
import { passportCall } from "../utils/jwt.js";
import handlePolicies from "../middleware/handle-policies.middleware.js"
import SmsController from "../controllers/sms.controller.js";
import validateSchema from "../middleware/validate-dto.middleware.js";
import { SMS_DTO } from "../dto/dtoManager.js";

const router = Router();
const smsController = new SmsController();


router.post("/send", [passportCall("jwt"), handlePolicies(["ADMIN"]), validateSchema(SMS_DTO)], smsController.sendSms );


export default router