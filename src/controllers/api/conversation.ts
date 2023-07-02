import { NextFunction, Request, Response } from "express";
import {
  conversationZero,
  conversationOne,
  conversationTwo,
  conversationThree,
  conversationFour,
  conversationFive,
  conversationLoop,
} from "~/services";
import { UserSession, BaseConversationResponse } from "~/types";

interface Props {
  sessionID: string;
  session: UserSession;
}

const getSessionData = (req: Request): Props => {
  const sessionID = req.sessionID;
  const session = req.session as UserSession;
  return { sessionID, session };
};

export const conversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang as string;
    if (!lang) return res.status(400).json({ message: "need lang query" });
    const { id } = req.params;
    const { user } = req.body;
    const { sessionID, session } = getSessionData(req);
    const _user = lang === "ko" ? res.locals.translatedText : user;
    const data: BaseConversationResponse = {
      contents: {},
      currentStage: "",
      nextStage: "",
    };

    if (id === "0") {
      const { currentStage, nextStage, contents } = await conversationZero({
        sessionID,
        session,
        lang,
        user: _user,
      });
      data.contents = contents;
      data.currentStage = currentStage;
      data.nextStage = nextStage;
    } else if (id === "1") {
      const { currentStage, nextStage, contents } = await conversationOne({ sessionID, session, lang, user: _user });
      data.contents = contents;
      data.currentStage = currentStage;
      data.nextStage = nextStage;
    } else if (id === "2") {
      const { currentStage, nextStage, contents } = await conversationTwo({ sessionID, session, lang, user: _user });
      data.contents = contents;
      data.currentStage = currentStage;
      data.nextStage = nextStage;
    } else if (id === "3") {
      const { currentStage, nextStage, contents } = await conversationThree({ sessionID, session, lang, user: _user });
      data.contents = contents;
      data.currentStage = currentStage;
      data.nextStage = nextStage;
    } else if (id === "4") {
      const { currentStage, nextStage, contents } = await conversationFour({ sessionID, session, lang, user: _user });
      data.contents = contents;
      data.currentStage = currentStage;
      data.nextStage = nextStage;
    } else if (id === "5") {
      const { currentStage, nextStage, contents } = await conversationFive({ sessionID, session, lang, user: _user });
      data.contents = contents;
      data.currentStage = currentStage;
      data.nextStage = nextStage;
    } else {
      // additional question loop
      const { currentStage, nextStage, contents } = await conversationLoop({
        id,
        sessionID,
        session,
        lang,
        user: _user,
      });
      data.contents = contents;
      data.currentStage = currentStage;
      data.nextStage = nextStage;
    }
    res.locals.finalTranslation = { data };
    next();
    // return res.status(200).json({ message: `conversation ${id} connect success`, data });
  } catch (e) {
    next();
    console.error("", e);
  }
};
