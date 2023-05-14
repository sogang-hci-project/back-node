import { dbType } from "./index";
import { Model, DataTypes } from "sequelize";
import sequelize from "./sequelize";

class Message extends Model {
  public readonly id!: number;
  public type: string;
  public request: string;
  public response: string;
  public readonly createAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    request: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Message",
    tableName: "messages",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

export const associate = (db: dbType) => {
  db.Message.belongsTo(db.User);
};
export default Message;
