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

export const postSessionGreeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const UserSessionId = `sess:${req.sessionID}`;
    const { question, header } = req.body;
    const { free } = header;
    const currentStage = "/session/greeting";
    const nextStage = "/vts/init";
    const result: AxiosResponse = await axios.post(`${FLASK_SERVER}/talk`, { question, header });

    const answer = result.data.contents.answer;
    const source = result.data.contents.source;
    const relevantSources = JSON.stringify(result.data.contents.relevantSources);
    await Message.create({
      question,
      answer,
      source,
      relevantSources,
      stage: currentStage,
      type: "dynamic",
      free,
      UserSessionId,
    });

    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;

    return res
      .status(200)
      .json({ message: "greeting success", question, answer, source, relevantSources, currentStage, nextStage });
  } catch (e) {
    next(e);
  }
};

export const postVTSInit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const UserSessionId = `sess:${req.sessionID}`;
    const { question, header } = req.body;
    const { free } = header;
    const currentStage = "/vts/init";
    const nextStage = "/vts/first?additional=true";
    const answer = VTS.what;

    await Message.create({
      question,
      answer,
      source: "static",
      relevantSources: "static",
      stage: currentStage,
      type: "static",
      free,
      UserSessionId,
    });

    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;

    return res.status(200).json({
      message: "greeting success",
      question,
      answer,
      source: "static",
      relevantSources: "static",
      currentStage,
      nextStage,
    });
  } catch (e) {
    next(e);
  }
};

export const postVTSFirst = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const UserSessionId = `sess:${req.sessionID}`;
    const { question, header } = req.body;
    const { additional } = req.query;
    const { free } = header;
    const currentStage = "/vts/first";
    const nextStage = "/vts/first?additional=false";
    const result: AxiosResponse = await axios.post(`${FLASK_SERVER}/talk`, { question, header });

    const answer = result.data.contents.answer;
    const source = result.data.contents.source;
    const relevantSources = JSON.stringify(result.data.contents.relevantSources);
    await Message.create({
      question,
      answer,
      source,
      relevantSources,
      stage: currentStage,
      type: "dynamic",
      free,
      UserSessionId,
    });

    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;

    return res.status(200).json({
      message: "greeting success",
      question,
      answer,
      source: "static",
      relevantSources: "static",
      currentStage,
      nextStage,
    });
  } catch (e) {
    next(e);
  }
};
