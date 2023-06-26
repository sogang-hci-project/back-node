import { Request, NextFunction, Response } from "express";
import session from "express-session";
import { initSession, preInitSession } from "~/services";

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
    const { sessionID, currentStage, nextStage } = await initSession();

    return res.status(200).json({
      message: "session init success",
      sessionID,
      currentStage,
      nextStage,
    });
  } catch (e) {
    next(e);
  }
};

export const getPreInitSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionID = req.sessionID;
    const session = req.session as UserSession;
    const lang = req.query.lang as string;
    if (!lang) return res.status(400).json({ message: "need lang query" });

    const { contents, currentStage, nextStage } = await preInitSession(sessionID, session, lang);

    return res.status(200).json({ message: "success", contents, currentStage, nextStage });
  } catch (e) {
    next(e);
  }
};
