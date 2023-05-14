export { default as sequelize } from "./sequelize";
export { default as User } from "./user";
export { default as Message } from "./message";

import sequelize from "./sequelize";
import User, { associate as UserAssociate } from "./user";
import Message, { associate as MessageAssociate } from "./message";

const db = {
  sequelize,
  User,
  Message,
};

UserAssociate(db);
MessageAssociate(db);

export type dbType = typeof db;
export default db;
