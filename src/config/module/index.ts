import RedisStore from "connect-redis";
import { redisClient } from "~/lib/redis";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const redisStore = new RedisStore({ client: redisClient });
export const maxAge = 1000 * 60 * 60 * 12; // 12h
// const maxAge = 1000 * 30; // 30s

export const isProd = process.env.NODE_ENV === "production";
export const corsOptions = {
  // origin: true,
  origin: "https://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};
export const sessionOptions: any = {
  store: redisStore,
  genid: function () {
    return uuidv4();
  },
  secret: process.env.COOKIE_SECRET,
  name: process.env.SESSION_NAME,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "None",
    maxAge,
  },
};
