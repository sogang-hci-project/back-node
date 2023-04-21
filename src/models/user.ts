import { dbType } from "./index";
import { Model, DataTypes, BelongsToManyGetAssociationsMixin } from "sequelize";
import sequelize from "./sequelize";

class User extends Model {
  public readonly id!: number;
  public name: string;
  public email: string;
  public password: string;
  public readonly createAt!: Date;
  public readonly updatedAt!: Date;
  public getContentMeta!: BelongsToManyGetAssociationsMixin<User>;
}

User.init(
  {
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

export const associate = (db: dbType) => {};

export default User;
