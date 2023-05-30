import Redis from "ioredis";
// import { isProd } from "~/config/module";
import dotenv from "dotenv";
dotenv.config();
// const host = isProd ? process.env.REDIS_END_POINT : "127.0.0.1";
export const redisClient = new Redis({
  host: process.env.REDIS_END_POINT,
});
