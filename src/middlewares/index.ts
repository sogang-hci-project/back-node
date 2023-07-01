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
  if (req.url === "/greeting/0") {
    next();
    return;
  }
  try {
    const sessionID = req.query.sessionID as string;
    if (!sessionID)
      return res.status(400).json({
        message: "need to store sessionID in query string, if you don't have sessionID. start session init first ",
      });

    const session = JSON.parse(await redisClient.get(`sess:${sessionID}`));
    if (!session) return res.status(400).json({ message: "there's no session" });
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

export const initTranslation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang as string;
    const user = req.body.user;
    const typeOfLang = ["en", "ko"];
    if ((!lang || !typeOfLang.includes(lang)) && req.url !== "/greeting/0")
      return res.status(400).json({ message: "need lang query string" });
    if (req.url !== "/greeting/0" && !user) return res.status(400).json({ message: "incorrect data" });

    if (lang === "ko") {
      res.locals.translatedText = await deeplTranslate(user, lang);
      res.locals.original = user;
      console.log("미들웨어 : 한글 -> 영어 ");
      next();
    } else {
      next();
    }
  } catch (e) {
    console.error("🔥 init translation error🔥", e);
    next(e);
  }
};

export const finalTranslation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang as string;
    const { data } = res.locals.finalTranslation;
    if (!data) return res.status(400).json({ message: "need data for final translating " });

    if (lang === "ko") {
      const { agent } = data.contents;
      const result = await deeplTranslate(agent, "en");
      console.log("번역된 결과", result);
      data.contents.agent = result;
      console.log("미들웨어 : 한글 -> 영어 ");
    }
    return res.status(200).json({ message: "success", data });
  } catch (e) {
    console.error("🔥final translation error🔥", e);
    next(e);
  }
};
