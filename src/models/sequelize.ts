import { Sequelize, Options } from "sequelize";

import config from "../config/config";

const env = !process.env.NODE_ENV ? "development" : "production";
const sequelize = new Sequelize(config[env] as Options);

export default sequelize;
