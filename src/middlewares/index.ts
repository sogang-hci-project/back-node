import { Request, Response, NextFunction } from "express";

import { redisClient } from "~/lib/redis";
import { deeplTranslate } from "~/lib";

export const isSessionInit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alreadyInit = req.sessionStore;
    if (!alreadyInit) return res.status(400).json({ message: "need session init", nextStage: "/init" });
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * using sessionID stored in query string,
 * access redis store and get session data.
 * then, add that session data to request object
 */

export const addSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionID = req.query.sessionID as string;
    if (!sessionID)
      return res.status(400).json({
        message: "need to store sessionID in query string, if you don't have sessionID. start session init first ",
      });

    const session = JSON.parse(await redisClient.get(`sess:${sessionID}`));
    if (!session) return res.status(400).json({ message: "there's  no session" });
    req.session = session;
    req.sessionID = sessionID;
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * translate using DeepL API
 */

export const translation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang as string;
    const user = req.body.user;
    const typeOfLang = ["en", "ko"];
    if (!lang || !typeOfLang.includes(lang)) return res.status(400).json({ message: "need lang query string" });
    if (!user) return res.status(400).json({ message: "incorrect data" });

    if (lang === "ko") {
      res.locals.translatedText = await deeplTranslate(user, lang);
      res.locals.original = user;
      console.log("미들웨어 : 한글 -> 영어 ");
      next();
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
};
