import { dbType } from "./index";
import { Model, DataTypes } from "sequelize";
import sequelize from "./sequelize";

class Painting extends Model {
  public readonly id!: number;
  public name: string;
  public author: string;
  public year: string;
  public description: string;
  public readonly createAt!: Date;
  public readonly updatedAt!: Date;
}

Painting.init(
  {
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    year: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Painting",
    tableName: "paintings",
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

export const associate = (db: dbType) => {};

export default Painting;
