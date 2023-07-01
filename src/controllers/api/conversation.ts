import { NextFunction, Request, Response } from "express";
import { conversation_zero, conversation_one } from "~/services";
import { ConversationResponseZero, ConversationResponse, UserSession, ConversationResponseOne } from "~/types";

interface Props {
  sessionID: string;
  session: UserSession;
}

const getSessionData = (req: Request): Props => {
  const sessionID = req.sessionID;
  const session = req.session as UserSession;
  const lang = req.query.lang as string;
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
    const data: ConversationResponse = {};

    if (id === "0") {
      const { currentStage, nextStage, contents } = await conversation_zero({ sessionID, session, lang, user: _user });
      (data as ConversationResponseZero).contents = contents;
      (data as ConversationResponseZero).currentStage = currentStage;
      (data as ConversationResponseZero).nextStage = nextStage;
    } else if (id === "1") {
      const { currentStage, nextStage, contents } = await conversation_one({ sessionID, session, lang, user: _user });
      (data as ConversationResponseOne).contents = contents;
      (data as ConversationResponseOne).currentStage = currentStage;
      (data as ConversationResponseOne).nextStage = nextStage;
    } else if (id === "2") {
    }
    res.locals.translation = { data };
    next();
    // return res.status(200).json({ message: `conversation ${id} connect success`, data });
  } catch (e) {
    next();
    console.error("", e);
  }
};
