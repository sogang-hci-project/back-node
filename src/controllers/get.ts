import { Request, NextFunction, Response } from "express";
import session from "express-session";
import { User } from "~/models";
import { redisClient } from "~/lib/redis";

interface UserSession extends session.Session {
  user: {
    stage: string;
    init: boolean;
  };
}

export const getInitSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const sessionId = `sess:${req.sessionID}`;
    console.log(sessionId);
    const alreadyInit = await redisClient.get(sessionId);
    if (alreadyInit) return res.status(400).json({ message: "session already init" });

    await User.create({ sessionId, stage: "init" });
    session.user = { stage: "init", init: true };
    return res.status(200).json({ message: "success session init" });
  } catch (e) {
    next(e);
  }
};
