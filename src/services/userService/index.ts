import { Profile, User } from "../../db/models";
import { UserStatus, UserRole } from "../../utils/enums/user.enum";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/errors";
import {
  CreateUserData,
  RegisterUserData,
} from "../../interfaces/user.interface";
import BaseService from "../base.service";
import bcrypt from "bcryptjs";

class UserService extends BaseService<User> {
  constructor() {
    super(User, "User");
  }

  private userModel = User;
  public defaultIncludeables(withPermissions: boolean = false) {
    return [this.generateIncludeable(Profile, "profile")];
  }

  public async create(data: CreateUserData): Promise<User> {
    const { fullname, email, password, avatar, username, role } = data;

    const validRoles = Object.values(UserRole);
    // console.log("validRoles:", validRoles);
    const userRole = validRoles.includes(role) ? role : UserRole.user;

    const attributes = {
      fullname,
      email,
      password,
      avatar,
      status: UserStatus.active,
      username,
      role: userRole,
    };

    // create user
    const user = await this.userModel.create(attributes);

    return user;
  }

  public async update(
    id: number,
    data: Partial<RegisterUserData>
  ): Promise<User> {
    const {
      fullname,
      email,
      username,
      password,
      phoneNumber,
      avatar,
      role,
      // bio,
      // facebook,
      // instagram,
      // x,
      // linkedIn,
    } = data;

    const user = await this.getByIdOrError(id);

    // check email if email
    if (email && email !== user.email) {
      const emailCheck = await this.get({ email });
      if (emailCheck) {
        throw new BadRequestError("Email already in use");
      }
    }

    if (username && username !== user.username) {
      const usernameExists = await this.get({ username });
      if (usernameExists) {
        throw new BadRequestError("Username already in user");
      }
    }

    // Ensure role is valid (if provided)
    const validRoles = Object.values(UserRole);
    const userRole = validRoles.includes(role) ? role : user.role; // Default to existing role if not valid

    // validate positionId if position

    const attributes = {
      fullname,
      email,
      username,
      password,
      phoneNumber,
      avatar,
      role: userRole,
    };

    await user.update(attributes);

    // update profile

    // const profile = await profileService.get({ userId: user.id });
    console.log("useriD:", user.id);

    // const profileAttributes = { bio, facebook, instagram, linkedIn, x };

    // await profile.update(profileAttributes);

    return user.reload({ include: this.defaultIncludeables(true) });
  }

  public async getByEmailAndPassword(
    email: string,
    password: string
  ): Promise<User> {
    // check if user exists
    const user = await this.userModel.scope("withPassword").findOne({
      where: { email },
    });

    // throw error if user does not exist
    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // throw error if password is incorrect
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // return user
    return user;
  }

  public async getByEmailOrId(email?: string, id?: number): Promise<User> {
    let whereQuery: { email?: string; id?: number } = {};
    if (email) whereQuery.email = email;
    if (id) whereQuery.id = id;

    const user = await this.userModel.scope("withPassword").findOne({
      where: whereQuery,
    });

    if (!user) {
      throw new NotFoundError("User Not Found.");
    }
    return user;
  }
}

export default new UserService();
