import { Profile, User, Auth } from "../../db/models";
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
  public async register(data: RegisterUserData): Promise<User> {
    const {
      fullname,
      username,
      email,
      phoneNumber,
      password,
      avatar,
      bio,
      facebook,
      linkedIn,
      x,
      instagram,
    } = data;
    const whereOptions: { email: string; username?: string } = { email };
    if (username) whereOptions.username = username;

    const whereQuery = {
      [Op.or]: [whereOptions],
    };

    // Check Email, Username, PhoneNumber
    const userExists = await userService.get(whereQuery);
    if (userExists) {
      throw new BadRequestError("User already exists");
    }
    const attributes = {
      fullname,
      username,
      email,
      password,
      avatar,
      role: UserRole.user,
      status: UserStatus.active,
    };
    // create user
    const user = await User.create(attributes);

    // Create Profile
    await Profile.create({
      userId: user.id,
      bio,
      facebook,
      instagram,
      x,
      linkedIn,
      phoneNumber,
    });

    await user.reload({ include: userService.defaultIncludeables(true) });

    return user;
  }
  public async login(
    user: User
  ): Promise<{ accessToken: string; refreshToken: string; user: object }> {
    if (user.status !== UserStatus.active) {
      throw new UnauthorizedError(
        "Your account is inactive. Please contact admin."
      );
    }
    const userIdentity = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    // generate access token
    const accessToken = jwtUtil.generate(userIdentity);
    const refreshToken = jwtUtil.generate(userIdentity);

    // reload user with includeables
    await user.reload({ include: userService.defaultIncludeables(true) });
    await this.createOrUpdate({ userId: user.id, isLoggedIn: true });
    delete user.dataValues.password;
    return { accessToken, refreshToken, user };
  }
  public async logout(userId: number): Promise<void> {
    const isAutherized = await this.getByFKsOrError({ userId });
    await isAutherized.update({ isLoggedIn: false }, { returning: true });

    await isAutherized.reload();
  }
  public async changePassword(
    id: number,
    newPassword: string,
    oldPassword: string
  ): Promise<void> {
    const user = await userService.getByEmailOrId(null, id);

    const isAutherized = bcrypt.compareSync(oldPassword, user.password);

    if (!isAutherized) {
      throw new UnauthorizedError("Wrong Password");
    }
    await userService.update(id, { password: newPassword });
  }

  public async isLoggedIn(userId: number): Promise<boolean> {
    return (await this.get({ userId })).isLoggedIn;
  }
}

export default new AuthService();
