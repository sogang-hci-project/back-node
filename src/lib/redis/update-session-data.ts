import { UserSession } from "~/controllers";
import { redisClient } from "~/lib/redis";
export async function updateSessionData(session: UserSession, sessionID: string) {
  await redisClient.set(`sess:${sessionID}`, JSON.stringify(session));
}
