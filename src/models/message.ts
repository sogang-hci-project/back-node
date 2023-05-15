import { dbType } from "./index";
import { Model, DataTypes } from "sequelize";
import sequelize from "./sequelize";

class Message extends Model {
  public readonly id!: number;
  public type: string;
  public free: boolean;
  public stage: string;
  public user: string;
  public agent: string;
  public source: string;
  public relevantSource: string;
  public readonly createAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    type: {
      type: DataTypes.ENUM("dynamic", "static"),
      allowNull: false,
    },
    free: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    stage: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    user: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    agent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    relevantSources: {
      type: DataTypes.STRING(500),
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
