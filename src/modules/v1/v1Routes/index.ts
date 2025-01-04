import { Router } from "express";
import { NotFoundError } from "../../../utils/errors";
import authRoutes from "./authRoutes";

class V1Routes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes(): void {
    this.router.use("/auth", authRoutes);
    // To catch 404 Errors
    this.router.use("*", () => {
      throw new NotFoundError(
        "API Endpoint does not exist or is currently under construction"
      );
    });
  }
}

export default new V1Routes().router;
