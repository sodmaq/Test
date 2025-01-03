import { StringifyOptions } from "querystring";

export interface AuthAttribute {
  id: number;
  userId: number;
  isLoggedIn: boolean;
  otpCode?: string;
  otpCreatedAt?: Date;

  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
