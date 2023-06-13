import { v4 as uuidv4 } from "uuid";
import { redisClient } from "~/lib/redis";
import { updateSessionData } from "~/lib";
import { UserSession } from "~/controllers";
import { VTS } from "~/constants";

export const initSession = async () => {
  const currentStage = "/session/init";
  const nextStage = "/session/pre";

  const sessionID = uuidv4();
  const session = { user: { currentStage, nextStage } };
  await redisClient.set(`sess:${sessionID}`, JSON.stringify(session));

  return { sessionID, currentStage, nextStage };
};

export const preInitSession = async (sessionID: string, session: UserSession, lang: string) => {
  const currentStage = "/session/pre";
  const nextStage = "/session/greeting";

  // init context
  let context = JSON.parse(await redisClient.get(`context:${sessionID}`));
  if (!context) context = [];
  const chat = { id: context.length + 1, human: "", ai: VTS.introduce };
  context.push(chat);
  await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

  // update user session data
  session.user.currentStage = currentStage;
  session.user.nextStage = nextStage;
  updateSessionData(session, sessionID);
  const contents = { agent: lang === "ko" ? VTS.introduceKorean : VTS.introduce };

  return { contents, currentStage, nextStage };
};
