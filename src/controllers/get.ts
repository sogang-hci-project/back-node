import { Request, NextFunction, Response } from "express";
import session from "express-session";
import { User } from "~/models";
import { redisClient } from "~/lib/redis";

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
}

/**
 * GET controller for session init
 * @param req {Request} HTTP request
 * @param res {Response} HTTP response
 * @param next {NextFunction} error handling
 */

export const getInitSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const sessionId = `${req.sessionID}`;
    const currentStage = "/session/init";
    const nextStage = "/session/greeting";
    //'sess' means session
    const alreadyInit = await redisClient.get(`sess:${sessionId}`);
    if (alreadyInit)
      return res.status(400).json({ message: "session already init", nextStage: `${session.user.nextStage}` });
    await User.create({ sessionId });
    session.user = { currentStage, nextStage };
    res.setHeader("Access-Control-Allow-Origin", "https://localhost:3000");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    return res
      .status(200)
      .cookie("x_auth", "test123123", {
        secure: true,
        sameSite: "none",
        httpOnly: true,
      })
      .json({ message: "success session init", currentStage, nextStage });
  } catch (e) {
    next(e);
  }
};
