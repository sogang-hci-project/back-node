import { redisClient } from "~/lib/redis";
import { Request, Response, NextFunction } from "express";

export const isSessionInit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = `sess:${req.sessionID}`;
    const alreadyInit = await redisClient.get(sessionId);
    if (!alreadyInit) return res.status(400).json({ message: "need session init", nextStage: "/init" });
    next();
  } catch (e) {
    next(e);
  }
};
