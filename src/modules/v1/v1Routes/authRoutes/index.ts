import { Router } from "express";
import AuthController from "../../controllers/authController";
import authMiddleware from "../../../../middlewares/auth.middleware";
import customMiddleware from "../../../../middlewares/custom.middleware";
import userValidator from "../../../../utils/validators/user.validator";

class AuthRoutes extends AuthController {
  public router: Router;

  constructor() {
    super();
    this.router = Router();
    this.routes();
  }
  private routes(): void {}
}
