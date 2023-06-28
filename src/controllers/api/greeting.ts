import { NextFunction, Request, Response } from "express";
import { greeting_one, greeting_two, greeting_zero } from "~/services/api/greeting";
import { GreetingResponse, GreetingResponseOne, GreetingResponseTwo, UserSession } from "~/types";

interface Props {
  sessionID: string;
  session: UserSession;
  lang: string;
}

const getSessionData = (req: Request): Props => {
  const sessionID = req.sessionID;
  const session = req.session as UserSession;
  const lang = req.query.lang as string;

  return { sessionID, session, lang };
};

export const greeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req.body;
    const lang = req.query.lang as string;
    const _user = lang === "ko" ? res.locals.translatedText : user;

    const data: GreetingResponse = {};
    if (id === "0") {
      const { sessionID, currentStage, nextStage } = await greeting_zero();
      (data as GreetingResponseOne).sessionID = sessionID;
      (data as GreetingResponseOne).currentStage = currentStage;
      (data as GreetingResponseOne).nextStage = nextStage;
    } else if (id === "1") {
      const { sessionID, session } = getSessionData(req);
      if (!lang) return res.status(400).json({ message: "need lang query" });
      const { contents, currentStage, nextStage } = await greeting_one(sessionID, session, lang);
      (data as GreetingResponseTwo).contents = contents;
      (data as GreetingResponseTwo).currentStage = currentStage;
      (data as GreetingResponseTwo).nextStage = nextStage;
    } else if (id === "2") {
      const { sessionID, session } = getSessionData(req);
      const { contents, currentStage, nextStage } = await greeting_two(sessionID, session, lang, _user);
      (data as GreetingResponseTwo).contents = contents;
      (data as GreetingResponseTwo).currentStage = currentStage;
      (data as GreetingResponseTwo).nextStage = nextStage;
    }
    return res.status(200).json({ message: `greeting ${id} connect success`, data });
  } catch (e) {
    console.error("", e);
    next();
  }
};
