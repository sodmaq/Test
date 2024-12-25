import { NextFunction, Request, Response, Router } from "express";
import apiResponse from "../utils/apiResponse";
import { NotFoundError } from "../utils/errors";
import customMiddleware from "../middlewares/custom.middleware";
import config from "../config";
import v1Routes from "../modules/v1/v1Routes";

class Routes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes(): void {
    this.router.get(
      "/",
      (req: Request, res: Response, next: NextFunction): void => {
        const data: object = {
          owner: "sodmaq",
        };

        apiResponse.successResponse(res, 200, "test api", data);
      }
    );

    this.router.use(customMiddleware.formatRequestQuery);

    // V1 Routes
    this.router.use(`${config.V1_URL}`, v1Routes);

    // Payment Routes

    // Admin Routes

    this.router.use("*", () => {
      throw new NotFoundError(
        "API Endpoint does not exist or is currently in construction"
      );
    });
  }
}

export default new Routes().router;
