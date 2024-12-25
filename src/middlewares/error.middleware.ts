import { NextFunction, Request, Response } from "express";
import config from "../config";
import { ServerEnvOptions } from "../utils/enums/config.enums";
import { SystemError } from "../utils/errors";
import Joi from "joi";
import apiResponse from "../utils/apiResponse";
import { errorLogger } from "../utils/logger";

class ErrorMiddlewares {
  public async errorHandler(
    error: SystemError,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const isProduction = config.NODE.ENV === ServerEnvOptions.PRODUCTION;

    let errorCode = error.code || 500;
    let errorMessage: SystemError | object = {};

    if (res.headersSent) {
      next(error);
    }

    if (!isProduction) {
      config.DEBUG(error.stack);
    }

    const { method, path, ip } = req;

    if (error instanceof Joi.ValidationError) {
      let errorDetail = error.details.reduce((key: any, value) => {
        key[value.path.join(".")] = value.message;
        return key;
      }, {});
      return apiResponse.errorResponse(
        res,
        400,
        "Validation Error",
        errorDetail
      );
    }

    if (error instanceof SyntaxError) {
      errorCode = 400;
    }

    if (errorLogger && errorCode === 500) {
      errorLogger.error({
        ip,
        errorCode,
        message: error.message,
        method,
        timeStamp: new Date(),
        trace: error.stack,
      });
    }

    if (errorCode === 500 && isProduction) {
      return apiResponse.errorResponse(
        res,
        500,
        "An unexpected error occurred. Please try again later."
      );
    }

    let errors = {
      ...(error.errors && { error: error.errors }),
      ...(!isProduction && { trace: errorMessage, method, path }),
    };

    return apiResponse.errorResponse(res, errorCode, error.message, errors);
  }
}

export default new ErrorMiddlewares();
