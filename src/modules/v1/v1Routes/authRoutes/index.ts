import { Router } from "express";
import AuthController from "../../controllers/authController";
import authMiddleware from "../../../../middlewares/auth.middleware";
import customMiddleware from "../../../../middlewares/custom.middleware";
import userValidator from "../../../../utils/validators/user.validator";
