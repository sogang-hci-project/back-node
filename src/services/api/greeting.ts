import { v4 as uuidv4 } from "uuid";

import { VTS } from "~/constants";
import { redisClient } from "~/lib/redis";
import { UserSession } from "~/types";
import { updateSessionData } from "~/lib";

/**
 * create session
 * @returns sessionID
 */
export const greeting_one = async () => {
  try {
    const currentStage = "/greeting/1";
    const nextStage = "/greeting/2";

    const sessionID = uuidv4();
    const session = { user: { currentStage, nextStage } };
    await redisClient.set(`sess:${sessionID}`, JSON.stringify(session));

    return { sessionID, currentStage, nextStage };
  } catch (e) {
    console.error("", e);
  }
};

export const greeting_two = async (sessionID: string, session: UserSession, lang: string) => {
  try {
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
  } catch (e) {
    console.error("", e);
  }
};
