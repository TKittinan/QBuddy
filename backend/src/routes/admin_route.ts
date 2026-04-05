import { Router } from "express";
import { createAdmin } from "../controllers/admin_controller";

const router = Router();

router.post("/", createAdmin);

export default router;