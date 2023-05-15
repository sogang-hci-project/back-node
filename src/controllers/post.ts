import axios, { AxiosResponse } from "axios";
import { Request, Response, NextFunction } from "express";
import { UserSession } from "~/controllers/get";
import VTS from "~/constants/static";
import { FLASK_SERVER } from "~/constants";
import { Message } from "~/models";

/**
 * POST controller after session init
 * @param req {Request} HTTP request
 * req.body {
    "question":"안녕 나는 전시원이라고 해. 레오나르도 다빈치의 입장에서 너를 소개해줘.",
    "header":{
        "freetalk":false
    }
   }
 * @param res {Response} HTTP response
 * @param next {NextFunction} error handling
 */

export const postSessionGreeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const UserSessionId = `sess:${req.sessionID}`;
    const { question, header } = req.body;
    const { free } = header;
    const currentStage = "/session/greeting";
    const nextStage = "/vts/init";
    const result: AxiosResponse = await axios.post(`${FLASK_SERVER}/talk`, { question, header });
    const chat = result.data;
    await Message.create({ chat: chat.contents, stage: currentStage, type: "dynamic", free, UserSessionId });

    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;

    return res.status(200).json({ message: "greeting success", chat, currentStage, nextStage });
  } catch (e) {
    next(e);
  }
};
