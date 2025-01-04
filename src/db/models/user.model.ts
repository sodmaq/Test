import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { UserAttribute } from "../../interfaces/user.interface";
import { UserRole, UserStatus } from "../../utils/enums/user.enum";
import bcrypt from "bcryptjs";
import exp from "constants";
import Profile from "./profile.index";
class User
  extends Model<InferAttributes<User>, InferCreationAttributes<User>>
  implements UserAttribute
{
  declare id: number;
  declare fullname: string;
  declare username?: string;
  declare email: string;
  declare password: string;
  declare status: UserStatus;
  declare role: UserRole;
  declare avatar?: string;

  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

export function associateUser() {
  User.hasOne(Profile, {
    foreignKey: { allowNull: false, name: "userId" },
    as: "profile",
    onDelete: "CASCADE",
  });
}

export function initUser(connection: Sequelize) {
  User.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      fullname: { type: DataTypes.STRING, allowNull: false },
      username: { type: DataTypes.STRING, allowNull: true, unique: true },
      status: {
        type: DataTypes.ENUM(...Object.values(UserStatus)),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(...Object.values(UserRole)),
        allowNull: true,
      },
      avatar: { type: DataTypes.STRING, allowNull: true },
    },
    {
      sequelize: connection,
      timestamps: true,
      defaultScope: { attributes: { exclude: ["password"] } },
      scopes: { withPassword: { attributes: { include: ["password"] } } },
      hooks: {
        beforeCreate: async (user) => {
          console.log("Before create user:", user);
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          console.log("Before update user:", user);
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
      tableName: "users",
    }
  );
}

export default User;
