import { NextFunction, Request, Response } from "express";
import { ValidationResult } from "joi";
import { logger } from "../utils/logger";

class CustomMiddlewares {
  public formatRequestQuery(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        query: { page = 1, limit = 10, search },
      } = req;

      req.queryOpts = {
        page: Number(page) ? Number(page) : 1,
        limit: Number(limit) ? Number(limit) : 10,
        offset: ((page ? Number(page) : 1) - 1) * Number(limit),
        search: search ? (search as string) : undefined,
      };

      next();
    } catch (error) {
      next(error);
    }
  }

  public validateRequestBody = (
    validator: (req: Request) => ValidationResult
  ) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = validator(req);

      if (error) throw error;

      req.body = value;

      next();
    };
  };

  public requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      const logEntry = `method:${req.method}, endpoint:${req.url}, statusCode:${res.statusCode}, responseTime: ${duration}ms`;
      logger.info(logEntry);
    });

    next();
  }
}

export default new CustomMiddlewares();
