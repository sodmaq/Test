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
  public async refresh(refreshToken: string): Promise<string> {
    const { payload, expired } = jwtUtil.verify(refreshToken as string);
    if (expired) {
      throw new UnauthorizedError("Invalid token.");
    }

    const userIdentity = {
      id: payload.id,
      username: payload.username,
    };
    const accessToken = jwtUtil.generate(userIdentity);

    return accessToken;
  }
  public async setUpOTP(userId: number): Promise<string> {
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const isAutherized = await this.getByFKsOrError({ userId });
    await isAutherized.update({ otpCode, otpCreatedAt: new Date() }); //TODO investigate issue here
    await isAutherized.reload();

    return otpCode;
  }

  public async removeOTP(userId: number): Promise<void> {
    const isAutherized = await this.getByFKsOrError({ userId });
    await isAutherized.update({ otpCode: null, otpCreatedAt: null });

    await isAutherized.reload();
  }

  public async verifyOTP(otpCode: string, password: string): Promise<boolean> {
    const otpTTL = parseInt(process.env.OTP_TTL) * 60 * 1000 || 600000;
    const isAutherized = await this.get({ otpCode });
    if (!isAutherized) throw new BadRequestError("Invalid or expired OTP");

    const isOtpValid = isAutherized.otpCode === otpCode;
    const isOtpValidTTL =
      new Date().getTime() - isAutherized.otpCreatedAt.getTime() < otpTTL;

    if (!isOtpValid || !isOtpValidTTL)
      throw new BadRequestError("Invalid or expired OTP");
    await this.removeOTP(isAutherized.userId);
    await userService.update(isAutherized.userId, { password });

    return true;
  }
}

export default new AuthService();
