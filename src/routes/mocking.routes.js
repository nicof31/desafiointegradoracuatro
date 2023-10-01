import { Router } from "express";
import validatePersistence from "../middleware/envTestAuth.middleware.js";
import MockingController from "../controllers/mocking.controller.js";
const router = Router();

const mockingController = new MockingController();

router.get("/", validatePersistence, mockingController.addProductMock);

router.post("/", );

export default router

