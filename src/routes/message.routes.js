import { Router } from "express";
import authToken from "../middleware/usersessiontoken.js";
import { passportCall } from "../utils/jwt.js";
import handlePolicies from "../middleware/handle-policies.middleware.js"
import MessagesController from "../controllers/messages.controller.js";


const router = Router();
const messagesController = new MessagesController();

router.get('/', [passportCall("jwt"), handlePolicies(["USER"]), authToken], messagesController.getMessages);
router.post('/', [passportCall("jwt"), handlePolicies(["USER"]), authToken], messagesController.sendMessages);



export default router