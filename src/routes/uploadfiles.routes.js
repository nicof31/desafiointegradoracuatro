import { Router } from "express";
import UploaderController from "../controllers/uploader.controller.js";

const router = Router();
const uploaderController = new UploaderController();



router.post('/', uploaderController.uploadImage);

export default router