import { Response } from "express";

class ResponseUtil {
  public successResponse(
    res: Response,
    statusCode: number,
    message: string,
    data?: object,
    error: boolean = false
  ): Response {
    if (statusCode < 200 || statusCode > 299) {
      throw new Error(
        `Invalid status code. Must be between 200 and 299 (inclusive)`
      );
    }

    message = message.endsWith(".") ? message : `${message}.`;

    return res.status(statusCode).json({ message, data, error });
  }

  public errorResponse(
    res: Response,
    statusCode: number,
    message: string,
    data?: object,
    error: boolean = true
  ): Response {
    message = message.endsWith(".") ? message : `${message}.`;
    return res.status(statusCode).json({ message, data, error });
  }
}

export default new ResponseUtil();
