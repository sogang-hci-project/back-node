import axios, { AxiosResponse } from "axios";
import { Request, Response, NextFunction } from "express";

import { UserSession } from "~/controllers/get";
import { LLM_SERVER } from "~/constants";
import { Message } from "~/models";
import VTS from "~/constants/static";

interface IData {
  user: string;
  sessionId?: string;
}

/**
 * POST controller after session init
 * @param req {Request} HTTP request
 * @param res {Response} HTTP response
 * @param next {NextFunction} error handling
 */

export const postSessionGreeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const check = session.user.sessionGreeting;
    const user = req.body.user;
    if (check) {
      const nextStage = session.user.nextStage;
      return res.status(400).json({ message: `greeting sesison already done`, nextStage });
    }
    if (!user) return res.status(400).json({ message: "incorrect API data" });
    const sessionId = `${req.sessionID}`;
    const currentStage = "/session/greeting";
    const nextStage = `/vts/init?additional=true`;

    const data: IData = { user, sessionId };
    const result: AxiosResponse = await axios.post(`${LLM_SERVER}/talk-with-free`, data);
    const agent = result.data.text;

    await Message.create({
      user,
      agent,
      free: true,
      stage: currentStage,
      type: "dynamic",
      UserSessionId: sessionId,
    });
    const contents = result.data;
    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    session.user.sessionGreeting = true;

    return res.status(200).json({ message: "greeting success", user, currentStage, nextStage, contents });
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
    const sessionId = `${req.sessionID}`;
    const { user } = req.body;
    let additional;
    if (req.query.additional === "true") additional = true;
    else if (req.query.additional === "false") additional = false;
    if (additional === undefined) return res.status(400).json({ message: "incorrect query string" });
    if (!user) return res.status(400).json({ message: "incorrect data" });
    const currentStage = `/vts/init?additional=${additional}`;
    const nextStage = additional ? `/vts/init?additional=${!additional}` : `/vts/first?additional=${!additional}`;

    const data: IData = { user, sessionId };
    const result: AxiosResponse = await axios.post(`${LLM_SERVER}/talk`, data);
    const agent = result.data.text;

    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;

    if (additional) {
      await Message.create({
        user,
        agent,
        free: false,
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
      const agent = "thank you for agreeing";
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
        message: "vts init, reply for first vts question",
        user,
        agent,
        VTS_FIRST: VTS.first,
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
    const data: IData = { user };
    let result: AxiosResponse;
    if (additional) {
      // if (additional) {
      // } else {
      //   user = `As visual thinking strategy practitioner, Rephrase the question below and answer it. \n ${user} `;
      // }
      user = `As visual thinking strategy practitioner, Rephrase the question below and answer it. And create one additional question for it. \n ${user}`;
      result = await axios.post(`${LLM_SERVER}/talk?ADDITIONAL=ADDITIONAL`, data);
    } else {
      result = await axios.post(`${LLM_SERVER}/talk?NEXT=NEXT`, data);
    }

    // const result: AxiosResponse = await axios.post(`${LLM_SERVER}/talk`, data);
    console.log("테스트 중입니다. 🔥🔥🔥🔥", result.data.contents);
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
      message: additional
        ? "reply for additional question"
        : "first additional question end. reply for second VTS session question",
      user,
      agent,
      source,
      VTS_SECOND: !additional && VTS.second,
      relevantSources,
      currentStage,
      nextStage,
    });
  } catch (e) {
    next(e);
  }
};

export const postVTSSecond = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const UserSessionId = `sess:${req.sessionID}`;
    let { user } = req.body;
    let additional;
    if (req.query.additional === "true") additional = true;
    else if (req.query.additional === "false") additional = false;
    if (additional === undefined) return res.status(400).json({ message: "incorrect query string" });
    if (!user) return res.status(400).json({ message: "incorrect data" });
    const currentStage = `/vts/second?additional=${additional}`;
    const nextStage = additional ? `/vts/second?additional=${!additional}` : `/vts/third?additional=${!additional}`;

    // if (additional) {
    //   user = `As visual thinking strategy practitioner, Rephrase the question below and answer it. And create one additional question for it. \n ${user}`;
    // } else {
    //   user = `As visual thinking strategy practitioner, Rephrase the question below and answer it. \n ${user} `;
    // }
    const data: IData = { user };

    const result: AxiosResponse = await axios.post(`${LLM_SERVER}/talk`, data);

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
      message: additional ? "reply for additional question" : "additional question end. reply for third VTS quesiton",
      user,
      agent,
      source,
      VTS_THIRD: !additional && VTS.third,
      relevantSources,
      currentStage,
      nextStage,
    });
  } catch (e) {
    next(e);
  }
};

export const postVTSThird = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const UserSessionId = `sess:${req.sessionID}`;
    let { user } = req.body;
    let additional;
    if (req.query.additional === "true") additional = true;
    else if (req.query.additional === "false") additional = false;
    if (additional === undefined) return res.status(400).json({ message: "incorrect query string" });
    if (!user) return res.status(400).json({ message: "incorrect data" });
    const currentStage = `/vts/third?additional=${additional}`;
    const nextStage = additional ? `/vts/third?additional=${!additional}` : `/vts/end`;

    // if (additional) {
    //   user = `As visual thinking strategy practitioner, Rephrase the question below and answer it. And create one additional question for it. \n ${user}`;
    // } else {
    //   user = `As visual thinking strategy practitioner, Rephrase the question below and answer it. \n ${user} `;
    // }
    const data: IData = { user };

    const result: AxiosResponse = await axios.post(`${LLM_SERVER}/talk`, data);

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
      message: additional ? "reply for third additional question" : "VTS session end",
      user,
      agent,
      source,
      VTS_EVALUATE: !additional && VTS.evaluate,
      relevantSources,
      currentStage,
      nextStage,
    });
  } catch (e) {
    next(e);
  }
};

export const postVTSEnd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const UserSessionId = `sess:${req.sessionID}`;
    let { user } = req.body;
    if (!user) return res.status(400).json({ message: "incorrect data" });
    const currentStage = `/vts/end`;
    const nextStage = `/qna?additional=true`;

    // if (additional) {
    //   user = `As visual thinking strategy practitioner, Rephrase the question below and answer it. And create one additional question for it. \n ${user}`;
    // } else {
    //   user = `As visual thinking strategy practitioner, Rephrase the question below and answer it. \n ${user} `;
    // }

    const agent = "none";
    const source = `user's response`;
    const relevantSources = `user's response`;

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
      message: "Thank you for participating in the evaluation.",
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

export const postQNA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const UserSessionId = `sess:${req.sessionID}`;
    let { user } = req.body;
    let additional;
    if (req.query.additional === "true") additional = true;
    else if (req.query.additional === "false") additional = false;
    if (additional === undefined) return res.status(400).json({ message: "incorrect query string" });
    else if (additional === false) return res.status(200).json({ message: "End the Q&A" });
    if (!user) return res.status(400).json({ message: "incorrect data" });

    const currentStage = `/qna?additional=${additional}`;
    const nextStage = `/qna?additional=`;

    // if (additional) {
    //   user = `As visual thinking strategy practitioner, Rephrase the question below and answer it. And create one additional question for it. \n ${user}`;
    // } else {
    //   user = `As visual thinking strategy practitioner, Rephrase the question below and answer it. \n ${user} `;
    // }

    const data: IData = { user };

    const result: AxiosResponse = await axios.post(`${LLM_SERVER}/talk`, data);

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
      message:
        "If you want to continue the query, send another request to the same endpoint with the query string additional value of true.",
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
