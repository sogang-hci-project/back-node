import { Request, NextFunction, Response } from "express";
import session from "express-session";

interface UserSession extends session.Session {
  stage: string;
  init: boolean;
}

export const getInitSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    session.stage = "init";
    session.init = true;
    res.status(200).json({ message: "init success" });
  } catch (e) {
    next(e);
  }
};
