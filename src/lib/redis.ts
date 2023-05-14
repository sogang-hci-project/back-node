import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
// export const redisClient = new Redis(process.env.REDIS_END_POINT);
export const redisClient = new Redis({
  host: "127.0.0.1",
});
