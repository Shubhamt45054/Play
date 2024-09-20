import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
const router = Router()

// register route hai , registerUser nhii
router.route("/register").post(registerUser)


export default router 