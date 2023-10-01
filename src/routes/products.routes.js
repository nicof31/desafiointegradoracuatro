import { Router } from "express";
import { passportCall } from "../utils/jwt.js";
import authToken from "../middleware/usersessiontoken.js";
import handlePolicies from "../middleware/handle-policies.middleware.js"
import ProductsController from "../controllers/products.controller.js";
import validateSchema from "../middleware/validate-dto.middleware.js";
import { PRODUCT_DTO } from "../dto/dtoManager.js";

const router = Router();
const productsController = new ProductsController();


router.get("/:pid", [passportCall("jwt"), handlePolicies(["ADMIN","USER","PUBLIC"]), authToken], productsController.getIdProducts);
router.get("/", [passportCall("jwt"), handlePolicies(["ADMIN","USER","PUBLIC"]), authToken], productsController.getCombProducts);
router.post("/", [passportCall("jwt"), handlePolicies(["ADMIN","PREMIUM"]), authToken,  validateSchema(PRODUCT_DTO)], productsController.addToProduct);
router.put("/:pid", [passportCall("jwt"), handlePolicies(["ADMIN","PREMIUM"]), authToken, validateSchema(PRODUCT_DTO)], productsController.updateProductsComplet);
router.patch("/:pid", [passportCall("jwt"), handlePolicies(["ADMIN","PREMIUM"])], authToken, productsController.updateProductsPatch);
router.delete("/:pid", [passportCall("jwt"), handlePolicies(["ADMIN","PREMIUM"])], authToken, productsController.deleteProduct);

export default router