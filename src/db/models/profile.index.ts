import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { ProfileAtrribute } from "../../interfaces/user.interface";
import User from "./user.model";

class Profile
  extends Model<InferAttributes<Profile>, InferCreationAttributes<Profile>>
  implements ProfileAtrribute
{
  declare id: number;
  declare userId: number;
  declare bio: string;
  declare linkedIn: string;
  declare facebook: string;
  declare instagram: string;
  declare x: string;
  declare phoneNumber: string;

  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

export function initProfile(connection: Sequelize) {
  Profile.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false, unique: false },
      bio: { type: DataTypes.STRING, allowNull: true },
      linkedIn: { type: DataTypes.STRING, allowNull: true },
      facebook: { type: DataTypes.STRING, allowNull: true },
      instagram: { type: DataTypes.STRING, allowNull: true },
      x: { type: DataTypes.STRING, allowNull: true },
      phoneNumber: { type: DataTypes.STRING, allowNull: true, unique: true },
    },
    {
      sequelize: connection,
      timestamps: true,
      tableName: "profiles",
    }
  );
}

export function associateProfile() {
  Profile.belongsTo(User, {
    foreignKey: { allowNull: false, name: "userId" },
    as: "user",
    onDelete: "CASCADE",
  });
}

export default Profile;
