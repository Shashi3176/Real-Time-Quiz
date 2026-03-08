import express from "express";
import { signup, login, logout } from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", verifyJWT, logout);

export default router;