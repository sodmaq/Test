import { UserStatus, UserRole } from "../utils/enums/user.enum";

export interface UserAttribute {
  id: number;
  fullname: string;
  username?: string;
  email: string;
  password: string;
  status: string;
  role: string;
  avatar?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface ProfileAtrribute {
  id: number;
  userId: number;
  bio: string;
  linkedIn: string;
  facebook: string;
  instagram: string;
  x: string;
  phoneNumber: string;
}

export interface CreateUserData {
  fullname: string;
  email: string;
  username?: string;
  password: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
}

export interface RegisterUserData {
  fullname: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  avatar?: string;
  role: UserRole;
  bio?: string;
  linkedIn?: string;
  facebook?: string;
  instagram?: string;
  x?: string;
}
