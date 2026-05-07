import { Router } from "express";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword
} from "../controllers/authController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
