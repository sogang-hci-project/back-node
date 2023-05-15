import axios, { AxiosResponse } from "axios";
import { Request, Response, NextFunction } from "express";

import { UserSession } from "~/controllers/get";
import { FLASK_SERVER } from "~/constants";
import { Message } from "~/models";
import VTS from "~/constants/static";

/**
 * POST controller after session init
 * @param req {Request} HTTP request
 * @param res {Response} HTTP response
 * @param next {NextFunction} error handling
 */

interface IData {
  user: string;
  header: { additional?: boolean; end?: boolean; qna?: boolean };
}

export const postSessionGreeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const UserSessionId = `sess:${req.sessionID}`;
    const user = `As visual thinking strategy practitioner,${req.body.user}`;
    const currentStage = "/session/greeting";
    const nextStage = `/vts/init?additional=true`;
    const data: IData = { user, header: { additional: false } };

    const result: AxiosResponse = await axios.post(`${FLASK_SERVER}/talk`, data);

    const agent = result.data.contents.answer;
    const source = result.data.contents.source;
    const relevantSources = JSON.stringify(result.data.contents.relevantSources);
    await Message.create({
      user,
      agent,
      source,
      relevantSources,
      free: false,
      stage: currentStage,
      type: "dynamic",
      UserSessionId,
    });

    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;

    return res
      .status(200)
      .json({ message: "greeting success", user, agent, source, relevantSources, currentStage, nextStage });
  } catch (e) {
    next(e);
  }
};

/**
 * VTS Introduce and VTS agree
 * @param req
 * @param res
 * @param next
 * @returns
 */

export const postVTSInit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const UserSessionId = `sess:${req.sessionID}`;
    const { user } = req.body;
    let additional;
    if (req.query.additional === "true") additional = true;
    else if (req.query.additional === "false") additional = false;
    if (additional === undefined) return res.status(400).json({ message: "incorrect query string" });
    if (!user) return res.status(400).json({ message: "incorrect data" });
    const currentStage = `/vts/init?additional=${additional}`;
    const nextStage = additional ? `/vts/init?additional=${!additional}` : `/vts/first?additional=${!additional}`;

    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;

    if (additional) {
      const agent = VTS.what;
      await Message.create({
        user,
        agent,
        source: "static",
        free: false,
        relevantSources: "static",
        stage: currentStage,
        type: "static",
        UserSessionId,
      });
      return res.status(200).json({
        message: "vts introduce success, please agree with starting to vts session",
        user,
        agent,
        source: "static",
        relevantSources: "static",
        currentStage,
        nextStage,
      });
    } else {
      /**
        TODO : 자연어 처리 로직 추가 
      */
      // const result: AxiosResponse = await axios.post(`${FLASK_SERVER}/talk`, data);
      const agent = "thank you";
      const source = "static";
      const relevantSources = "static";
      await Message.create({
        user,
        agent,
        source,
        free: false,
        relevantSources,
        stage: currentStage,
        type: "dynamic",
        UserSessionId,
      });
      return res.status(200).json({
        message: "vts first init, reply for first vts question",
        user,
        agent,
        first: VTS.first,
        source: "static",
        relevantSources: "static",
        currentStage,
        nextStage,
      });
    }
  } catch (e) {
    next(e);
  }
};

/**
 * VTS first session and first additional quesiton
 * TODO : 그림 정보를 알아내는 자연어 처리 로직 필요
 * @param req
 * @param res
 * @param next
 * @returns
 */

export const postVTSFirst = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const UserSessionId = `sess:${req.sessionID}`;
    let { user } = req.body;
    let additional;
    if (req.query.additional === "true") additional = true;
    else if (req.query.additional === "false") additional = false;
    if (additional === undefined) return res.status(400).json({ message: "incorrect query string" });
    if (!user) return res.status(400).json({ message: "incorrect data" });
    const currentStage = `/vts/first?additional=${additional}`;
    const nextStage = additional ? `/vts/first?additional=${!additional}` : `/vts/second?additional=${!additional}`;

    if (additional) {
      user = `As visual thinking strategy practitioner Rephrase the question below and answer it. And create one additional question for it. \n ${user}`;
    } else {
      user = `As visual thinking strategy practitioner Rephrase the question below and answer it. \n ${user} `;
    }
    const data: IData = { user, header: { additional } };

    const result: AxiosResponse = await axios.post(`${FLASK_SERVER}/talk`, data);

    const agent = result.data.contents.answer;
    const source = result.data.contents.source;
    const relevantSources = JSON.stringify(result.data.contents.relevantSources);

    await Message.create({
      user,
      agent,
      source,
      free: false,
      relevantSources,
      stage: currentStage,
      type: "dynamic",
      UserSessionId,
    });

    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;

    return res.status(200).json({
      message: additional ? "continue additional question" : "additional question end",
      user,
      agent,
      source,
      relevantSources,
      currentStage,
      nextStage,
    });
  } catch (e) {
    next(e);
  }
};
