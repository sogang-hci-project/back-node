export { default as sequelize } from "./sequelize";
export { default as Painting } from "./painting";

import sequelize from "./sequelize";
import Painting from "./painting";

const db = {
  sequelize,
  Painting,
};

export type dbType = typeof db;

export default db;
