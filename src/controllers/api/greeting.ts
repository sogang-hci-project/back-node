import { NextFunction, Request, Response } from "express";
import { greeting_one, greeting_two } from "~/services/api/greeting";
import { GreetingResponse, GreetingResponseOne, GreetingResponseTwo, UserSession } from "~/types";

export const greeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data: GreetingResponse = {};

    if (id === "1") {
      const { sessionID, currentStage, nextStage } = await greeting_one();
      (data as GreetingResponseOne).sessionID = sessionID;
      (data as GreetingResponseOne).currentStage = currentStage;
      (data as GreetingResponseOne).nextStage = nextStage;
    } else if (id === "2") {
      const sessionID = req.sessionID;
      const session = req.session as UserSession;
      const lang = req.query.lang as string;
      if (!lang) return res.status(400).json({ message: "need lang query" });
      const { contents, currentStage, nextStage } = await greeting_two(sessionID, session, lang);
      (data as GreetingResponseTwo).contents = contents;
      (data as GreetingResponseTwo).currentStage = currentStage;
      (data as GreetingResponseTwo).nextStage = nextStage;
      console.log("2 번째 서비스 로직 실행");
    } else if (id === "3") {
    }

    return res.status(200).json({ message: `greeting ${id} connect success`, data });
  } catch (e) {
    console.error("", e);
  }
};
