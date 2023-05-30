import { UserSession } from "~/controllers";
import { redisClient } from "~/lib/redis";

export function updateSessionDate(session: UserSession, sessionID: string) {
  redisClient.set(`sess:${sessionID}`, JSON.stringify(session));
}
