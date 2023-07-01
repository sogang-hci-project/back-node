import { VTS } from "~/constants";
import { redisClient, updateSessionData } from "~/lib";
import { UserSession } from "~/types";
import { returnAdditionalQuestion, returnVTS_three, returnVTS_two } from "./return-type";

interface Props {
  sessionID?: string;
  session?: UserSession;
  lang?: string;
  user?: string;
  id?: string;
}

export const conversationZero = async ({ sessionID, session, lang, user }: Props) => {
  try {
    const currentStage = "/conversation/0";
    const nextStage = "/conversation/1";
    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);

    // init context
    let context = JSON.parse(await redisClient.get(`context:${sessionID}`));
    if (!context) context = [];
    const chat = { id: context.length + 1, human: user, ai: `Thank you for agreeing. ${VTS.VTS_ONE_EN}` };
    context.push(chat);
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    const contents = { agent: lang === "ko" ? VTS.VTS_ONE_KO : VTS.VTS_ONE_EN };

    return { contents, currentStage, nextStage };
  } catch (e) {
    console.error("🔥 conversation zero service error 🔥", e);
  }
};

export const conversationOne = async ({ sessionID, session, user }: Props) => {
  try {
    const currentStage = "/conversation/1";
    const nextStage = "/conversation/1-1";
    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);

    const { agent } = await returnVTS_two({ sessionID, user });

    const contents = { agent };

    return { contents, currentStage, nextStage };
  } catch (e) {
    console.error("🔥 conversation one service error 🔥", e);
  }
};

export const conversationTwo = async ({ sessionID, session, user }: Props) => {
  try {
    const currentStage = "/conversation/2";
    const nextStage = "/conversation/3";
    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);

    const { agent } = await returnVTS_three({ sessionID, user });
    const contents = { agent };

    return { contents, currentStage, nextStage };
  } catch (e) {
    console.error("🔥 conversation two service error 🔥", e);
  }
};
export const conversationThree = async ({ sessionID, session, user }: Props) => {
  try {
    const currentStage = "/conversation/3";
    const nextStage = "/conversation/2-1";
    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);

    const { agent } = await returnVTS_two({ sessionID, user });
    const contents = { agent };

    return { contents, currentStage, nextStage };
  } catch (e) {
    console.error("🔥 conversation three service error 🔥", e);
  }
};
export const conversationFour = async ({ sessionID, session, user }: Props) => {
  try {
    const currentStage = "/conversation/4";
    const nextStage = "/conversation/5";
    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);

    const { agent } = await returnVTS_three({ sessionID, user });
    const contents = { agent };

    return { contents, currentStage, nextStage };
  } catch (e) {
    console.error("🔥 conversation four service error 🔥", e);
  }
};

export const conversationFive = async ({ sessionID, session, user }: Props) => {
  try {
    const currentStage = "/conversation/5";
    const nextStage = "/conversation/3-1";
    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);

    const { agent } = await returnVTS_two({ sessionID, user });
    const contents = { agent };

    return { contents, currentStage, nextStage };
  } catch (e) {
    console.error("🔥 conversation five service error 🔥", e);
  }
};

const getNextStage = (id: string) => {
  if (id === "1-1") return "1-2";
  else if (id === "1-2") return "1-3";
  else if (id === "1-3") return "2";
  else if (id === "2-1") return "2-2";
  else if (id === "2-2") return "2-3";
  else if (id === "2-3") return "4";
  else if (id === "3-1") return "3-2";
  else if (id === "3-2") return "3-3";
  else if (id === "3-3") return "end";
};

export const conversationLoop = async ({ sessionID, session, user, id }: Props) => {
  try {
    const currentStage = `/conversation/${id}`;
    const nextStage = `/conversation/${getNextStage(id)}`;
    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);

    const { agent } = await returnAdditionalQuestion({ sessionID, user });
    const contents = { agent };

    return { contents, currentStage, nextStage };
  } catch (e) {
    console.error(`🔥🔥 conversation loop error occur in ${id} 🔥🔥`, e);
  }
};
