import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { Model } from "sequelize";
import { DecodedToken } from "../../interfaces/jwt.interface";
import config from "../../config";
import { ServerEnvOptions } from "../enums/config.enums";

class TokenUtil {
  // private EncryptKey = fs
  //   .readFileSync(path.join(process.cwd(), "private.key"))
  //   .toString();

  // private DecryptKey = fs
  //   .readFileSync(path.join(process.cwd(), "public.key"))
  //   .toString();

  private EncryptKey: string;
  private DecryptKey: string;

  constructor() {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "staging" ||
      process.env.NODE_ENV === "testing"
    ) {
      this.EncryptKey = config.JWTKeys.encryptKey || "";
      this.DecryptKey = config.JWTKeys.decryptKey || "";
    } else {
      this.EncryptKey = fs
        .readFileSync(path.join(process.cwd(), "private.key"))
        .toString();
      this.DecryptKey = fs
        .readFileSync(path.join(process.cwd(), "public.key"))
        .toString();
    }
  }

  private getAlgorithm(environment: string): jwt.Algorithm {
    if (
      environment === ServerEnvOptions.DEVELOPMENT ||
      environment === ServerEnvOptions.STAGING ||
      environment === ServerEnvOptions.TESTING
    ) {
      return "HS256";
    } else {
      return "RS512";
    }
  }

  public generate(data: object, expiresIn: string = "7d"): string {
    const algorithm = this.getAlgorithm(
      config.NODE.ENV || ServerEnvOptions.DEVELOPMENT
    );

    const token = jwt.sign(data, this.EncryptKey, {
      algorithm: algorithm,
      expiresIn,
    });

    return token;
  }

  public verify(token: string): DecodedToken {
    const algorithm = this.getAlgorithm(
      config.NODE.ENV || ServerEnvOptions.DEVELOPMENT
    );
    try {
      const payload = jwt.verify(token, this.DecryptKey, {
        algorithms: [algorithm],
      }) as unknown as Model;

      return { payload, expired: false };
    } catch (error) {
      return {
        payload: null,
        expired: error.message.includes("expired") ? error.message : error,
      };
    }
  }
}

export default new TokenUtil();
