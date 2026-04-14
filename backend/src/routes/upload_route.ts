import { Router } from "express";
import { uploadImage } from "../controllers/upload_controller";
import { upload } from "../middlewares/upload_middleware";

const router = Router();

// field name = image
router.post("/", upload.single("image"), uploadImage);

export default router;