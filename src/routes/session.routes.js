import { Router } from "express";
import { passportCall } from "../utils/jwt.js";
import handlePolicies from "../middleware/handle-policies.middleware.js"
import SessionController from "../controllers/session.controller.js"
import validateSchema from "../middleware/validate-dto.middleware.js";
import { SESSION_REGISTER_DTO, SESSION_RECOVER_DTO } from "../dto/dtoManager.js";
import { uploader } from "../middleware/uploader.middleware.js";

const router = Router();
const sessController = new SessionController();

router.post("/register", [validateSchema(SESSION_REGISTER_DTO)], sessController.allToRegister);
router.post("/emailrecover", sessController.emailRecover); 
router.post("/recover-psw", [validateSchema(SESSION_RECOVER_DTO)],sessController.recoverUser);
router.post("/login", sessController.loginUser);
router.get("/github", sessController.loginGitHub);
router.get("/github/callback", sessController.githubCallback);
router.get("/logout", sessController.logoutUser);
router.get("/current", [passportCall("jwt"), handlePolicies(["ADMIN", "USER"])], sessController.getCurrentUserInfo);
router.get("/tickets", [passportCall("jwt"), handlePolicies(["ADMIN", "USER"])], sessController.getTicketsByUser);
router.get("/premium/:uid", [passportCall("jwt"), handlePolicies(["USER","ADMIN","PREMIUM"])], sessController.getUserRole);
router.post("/premium/:uid",[passportCall("jwt"), handlePolicies(["USER","ADMIN","PREMIUM"])], sessController.changeRole);
/*router.post(
    "/:uid/documents",
    uploader.fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'productImage', maxCount: 1 },
      { name: 'document', maxCount: 10 }
    ]),
    sessController.uploadDocuments
  );*/

router.post("/:uid/documents", [passportCall("jwt"), handlePolicies(["USER","ADMIN","PREMIUM"])],  uploader.any(), sessController.uploadDocuments);

export default router