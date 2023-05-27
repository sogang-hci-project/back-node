import RedisStore from "connect-redis";
import { redisClient } from "~/lib/redis";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const redisStore = new RedisStore({ client: redisClient });
const maxAge = 1000 * 60 * 60 * 12; // 12h
// const maxAge = 1000 * 30; // 30s

export const isProd = process.env.NODE_ENV === "production";
export const corsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200,
};
export const sessionOptions = {
  store: redisStore,
  genid: function () {
    return uuidv4();
  },
  secret: process.env.COOKIE_SECRET,
  name: process.env.SESSION_NAME,
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "none",
    secure: false,
    httpOnly: true,
    maxAge,
  },
};
