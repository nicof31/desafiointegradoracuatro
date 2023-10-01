import { Router } from "express";
import authToken from "../middleware/usersessiontoken.js";
import { passportCall } from "../utils/jwt.js";
import handlePolicies from "../middleware/handle-policies.middleware.js"
import CartsController from "../controllers/carts.controller.js";

const router = Router();
const cartController = new CartsController();


router.get("/", [passportCall("jwt"), authToken], cartController.getAllCarts);
router.get("/:cid", [passportCall("jwt"), authToken], cartController.getIdCarts);
router.post("/:pid", [passportCall("jwt"), handlePolicies(["USER","PREMIUM"]), authToken], cartController.addToCart);
router.post("/:cid/purchase",[passportCall("jwt"), authToken],cartController.purchaseCart);
router.put("/:cid/products/:pid", [passportCall("jwt"), authToken], cartController.updateCarts)
router.put("/:cid", [passportCall("jwt"), authToken], cartController.updateCartsComplet)
router.delete("/:cid", [passportCall("jwt"), authToken], cartController.deleteProductCarts)
router.delete("/:cid/products/:pid", [passportCall("jwt"), authToken], cartController.deleteOneProdCarts)

export default router