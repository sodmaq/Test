import { User, Auth } from "../../db/models";
import { UserRole, UserStatus } from "../../utils/enums/user.enum";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../../utils/errors";
import jwtUtil from "../../utils/jwtUtil";
import userService from "../userService";
import { RegisterUserData } from "../../interfaces/user.interface";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import BaseService from "../base.service";
import crypto from "crypto";
import { access } from "fs";

class AuthService extends BaseService<Auth> {
  constructor() {
    super(Auth, "Auth");
  }
}
