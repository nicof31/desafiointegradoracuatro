import { Router } from "express";
import { passportCall } from "../utils/jwt.js";
import handlePolicies from "../middleware/handle-policies.middleware.js"
import EmailController from "../controllers/email.controller.js";
import validateSchema from "../middleware/validate-dto.middleware.js";
import { EMAIL_DTO } from "../dto/dtoManager.js";

const router = Router();
const emailController = new EmailController();

router.post("/send", [passportCall("jwt"), handlePolicies(["ADMIN"]), validateSchema(EMAIL_DTO)],emailController.sendEmail);


export default router

