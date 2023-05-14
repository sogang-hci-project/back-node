import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
// export const redisClient = new Redis(process.env.REDIS_END_POINT);
export const redisClient = new Redis({
  port: 6379,
  host: "127.0.0.1",
  username: "default",
  password: "",
});
