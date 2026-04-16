import { Router } from "express";
import { createAdmin , removeAdmin } from "../controllers/admin_controller";

const router = Router();

router.post("/", createAdmin);

router.delete("/" , removeAdmin);

export default router;