import { Request, Response, NextFunction } from "express";

import { redisClient } from "~/lib/redis";
import { deeplTranslate, papagoTranslate } from "~/lib";

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
      const candidates = await Promise.allSettled<{ value: string }>([
        await deeplTranslate(user, "ko"),
        await papagoTranslate(user, "ko"),
      ]);
      const fufilled = candidates.filter((res) => res.status === "fulfilled");
      res.locals.translatedText = fufilled[0].status === "fulfilled" ? fufilled[0].value : "I don't understand";
      res.locals.original = user;
      console.log("■■■■■■■■■[MIDDLEWARE - TRANSLATION RESULT: 한글 -> 영어]■■■■■■■■■");
      console.log("[번역 API]:", fufilled.length === 2 ? "DEEPL" : "PAPAGO");
      console.log("[번역 전]:", user);
      console.log("[번역 후]:", res.locals.translatedText);
      next();
    } else {
      next();
    }
  } catch (e) {
    console.error("🔥 init translation error🔥", e);
    next(e);
  }
};

/**
 * translate using DeepL API
 */

export const finalTranslation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang as string;
    const { data } = res.locals.finalTranslation;
    if (!data) return res.status(400).json({ message: "need data for final translating " });

    if (lang === "ko") {
      const { agent } = data.contents;
      const candidates = await Promise.allSettled([
        await deeplTranslate(agent, "en"),
        await papagoTranslate(agent, "en"),
      ]);
      const fufilled = candidates.filter((res) => res.status === "fulfilled");
      data.contents.agent = fufilled[0].status === "fulfilled" ? fufilled[0].value : "다시 한번 말해주시겠어요?";
      console.log("■■■■■■■■■[MIDDLEWARE - TRANSLATION RESULT: 영어 -> 한글]■■■■■■■■■");
      console.log("[번역 API]:", fufilled.length === 2 ? "DEEPL" : "PAPAGO");
      console.log("[번역 전]:", agent);
      console.log("[번역 후]:", data.contents.agent);
    }
    return res.status(200).json({ message: "success", data });
  } catch (e) {
    console.error("🔥final translation error🔥", e);
    next(e);
  }
};
