import { dbType } from "./index";
import { Model, DataTypes } from "sequelize";
import sequelize from "./sequelize";

class User extends Model {
  public readonly id!: number;
  public sessionId: string;
  public stage: string;
  public readonly createAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    sessionId: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    stage: {
      type: DataTypes.STRING(50),
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

export const associate = (db: dbType) => {
  db.User.hasMany(db.Message, {
    as: "messages",
    onDelete: "cascade",
  });
};

export default User;
