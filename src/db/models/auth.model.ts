// category.model.ts
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { AuthAttribute } from "../../interfaces/auth.interface";
import User from "./user.model";

class Auth
  extends Model<InferAttributes<Auth>, InferCreationAttributes<Auth>>
  implements AuthAttribute
{
  declare id: number;
  declare userId: number;
  declare isLoggedIn: boolean;
  declare otpCode?: string;
  declare otpCreatedAt?: Date;

  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

export function initAuth(connection: Sequelize) {
  Auth.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      isLoggedIn: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      otpCode: { type: DataTypes.STRING, allowNull: true, unique: false },
      otpCreatedAt: { type: DataTypes.DATE, allowNull: true, unique: false },
    },
    {
      sequelize: connection,
      tableName: "authTable",
      timestamps: true,
    }
  );
}

export function auth() {
  Auth.belongsTo(User, { as: "auth", foreignKey: "userId" });
}

export default Auth;
