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
  private routes(): void {
    this.router
      .route("/register")
      .post(
        customMiddleware.validateRequestBody(userValidator.registerSchema),
        this.register.bind(this)
      );
    this.router
      .route("/login")
      .post(
        customMiddleware.validateRequestBody(userValidator.loginSchema),
        this.login.bind(this)
      );
    this.router
      .route("/logout")
      .post(authMiddleware.validateAccessToken, this.logout.bind(this));
    this.router
      .route("/change-password")
      .post(
        authMiddleware.validateAccessToken,
        customMiddleware.validateRequestBody(
          userValidator.changePasswordSchema
        ),
        this.changePassword.bind(this)
      );
    this.router
      .route("/refresh")
      .post(
        customMiddleware.validateRequestBody(userValidator.refreshSchema),
        this.refresh.bind(this)
      );
  }
}

export default new AuthRoutes().router;
