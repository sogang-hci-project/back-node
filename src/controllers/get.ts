import { Request, NextFunction, Response } from "express";
import session from "express-session";
import { redisClient } from "~/lib/redis";
import { v4 as uuidv4 } from "uuid";
import { VTS } from "~/constants";
import { updateSessionData } from "~/utils";

export interface UserSession extends session.Session {
  user: {
    currentStage: string;
    nextStage: string;
    next?: boolean;
    sessionGreeting?: boolean;
    initAdditional?: boolean;
    initDone?: boolean;
    firstAdditional?: boolean;
    firstDone?: boolean;
    secondAdditional?: boolean;
    secondDone?: boolean;
    thirdAdditional?: boolean;
    thirdDone?: boolean;
  };
  translatedText?: string;
}

/**
 * GET controller for session init
 */

export const getInitSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentStage = "/session/init";
    const nextStage = "/session/pre";

    const sessionID = uuidv4();
    const session = { user: { currentStage, nextStage } };
    await redisClient.set(`sess:${sessionID}`, JSON.stringify(session));
    return res.status(200).json({
      message: "session init success",
      sessionID,
      currentStage,
      nextStage,
      text: "final",
    });
  } catch (e) {
    next(e);
  }
};

export const getPreInitSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionID = req.sessionID;
    const session = req.session as UserSession;
    const lang = req.query.lang;
    const currentStage = "/session/pre";
    const nextStage = "/session/greeting";

    // init context
    let context = JSON.parse(await redisClient.get(sessionID));
    if (!context) context = [];
    const chat = { id: context.length + 1, human: "", ai: VTS.introduce };
    context.push(chat);
    await redisClient.set(sessionID, JSON.stringify(context));

    // update user session data
    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);
    const contents = { agent: lang === "ko" ? VTS.introduceKorean : VTS.introduce };

    return res.status(200).json({ message: "success", contents, currentStage, nextStage });
  } catch (e) {
    next(e);
  }
};
