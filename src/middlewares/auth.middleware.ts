import { NextFunction, Request, Response } from "express";
import { ForbbidenError, UnauthorizedError } from "../utils/errors";
import jwtUtil from "../utils/jwtUtil";
import userService from "../services/userService";
import { User } from "../db/models";
import authService from "../services/authService";
import { UserRole } from "../utils/enums/user.enum";

class AuthMiddleware {
  public async validateAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return next(new ForbbidenError("Missing Access Token"));
      }

      const accesstoken = authHeader.split(" ")[1];

      const { payload, expired } = jwtUtil.verify(accesstoken as string);
      if (expired) return next(new UnauthorizedError("Invalid token."));

      const isLoggedIn = await authService.isLoggedIn(payload.id);
      if (!isLoggedIn) return next(new UnauthorizedError("Invalid token."));

      const user = await userService.getById(
        (payload as User)?.id,
        userService.defaultIncludeables(true)
      );

      if (!user) return next(new UnauthorizedError("Invalid token"));
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  }
  public async isAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const isAdmin = req.user.role;
      if (isAdmin !== UserRole.admin) {
        return next(new ForbbidenError("Access Denied"));
      }
      next();
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthMiddleware();
