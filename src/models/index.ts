export { default as sequelize } from "./sequelize";
export { default as User } from "./user";

import sequelize from "./sequelize";
import User, { associate as UserAssociate } from "./user";

const db = {
  sequelize,
  User,
};

UserAssociate(db);

export type dbType = typeof db;

export default db;
