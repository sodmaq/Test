import { NextFunction, Request, Response } from "express";
import userService from "../../../../services/userService";
import authService from "../../../../services/authService";
import apiResponse from "../../../../utils/apiResponse";

export default class AuthControlller {
  protected async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    try {
      const { body } = req;
      const user = await authService.register(body);
      return apiResponse.successResponse(
        res,
        201,
        "Registration Successful",
        user
      );
    } catch (error) {
      next(error);
    }
  }

  protected async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    try {
      const {
        body: { email, password },
      } = req;

      //retrieve user
      const userData = await userService.getByEmailAndPassword(email, password);

      //login user
      const { accessToken, refreshToken, user } =
        await authService.login(userData);
      const data = {
        accessToken,
        refreshToken,
        user,
      };

      return apiResponse.successResponse(res, 200, "Login Successful", data);
    } catch (error) {
      next(error);
    }
  }

  protected async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    try {
      const { id } = req.user;
      await authService.logout(id);
      return apiResponse.successResponse(res, 200, "Logout Successful");
    } catch (error) {
      next(error);
    }
  }

  protected async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    try {
      const { id } = req.user;
      const { newPassword, oldPassword } = req.body;
      await authService.changePassword(id, newPassword, oldPassword);
      return apiResponse.successResponse(res, 200, "Password Changed");
    } catch (error) {
      next(error);
    }
  }
}
