import Redis from "ioredis";
import { isProd } from "~/config/module";

const host = isProd ? `hci-redis-store.ft0k3r.clustercfg.apn2.cache.amazonaws.com` : "127.0.0.1";
export const redisClient = new Redis({
  host,
});
