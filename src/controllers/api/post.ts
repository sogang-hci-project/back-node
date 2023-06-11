import axios, { AxiosResponse } from "axios";
import { Request, Response, NextFunction } from "express";

import { UserSession } from "~/controllers/api/get";
import { LLM_SERVER } from "~/constants";
import VTS from "~/constants/static";
import { redisClient } from "~/lib/redis";
import { clovaTextToSpeech, deeplTranslate, papagoTranslate, updateSessionData } from "~/utils";

interface IData {
  user: string;
  sessionID?: string;
  additional?: boolean;
  done?: boolean;
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
    const translatedText = res.locals?.translatedText;
    const lang = req.query.lang;
    let user = (lang === "ko" && translatedText) || req.body.user;
    if (!user) return res.status(400).json({ message: "incorrect API data" });

    const sessionID = `${req.sessionID}`;
    const currentStage = "/session/greeting";
    const nextStage = `/vts/init?additional=true`;

    const data: IData = { user, sessionID };
    const result: AxiosResponse = await axios.post(`${LLM_SERVER}/talk-with-free`, data);
    const agent = result.data.text;
    const contents = { agent };

    // update session data
    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);

    if (lang === "ko" && translatedText) {
      user = res.locals.original;
      contents.agent = await deeplTranslate(agent, "en");
      console.log("응답 보내기 전 : 한글 -> 영어");
    }

    return res.status(200).json({ message: "greeting success", user, contents, currentStage, nextStage });
  } catch (e) {
    next(e);
  }
};

/**
 * VTS Introduce and VTS agree
 * do not use LLM model
 */

export const postVTSInit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as UserSession;
    const sessionID = `${req.sessionID}`;
    const translatedText = res.locals?.translatedText;
    const lang = req.query.lang;
    let user = (lang === "ko" && translatedText) || req.body.user;
    if (!user) return res.status(400).json({ message: "incorrect data" });

    // 인증
    let additional;
    if (req.query.additional === "true") additional = true;
    else if (req.query.additional === "false") additional = false;
    if (additional === undefined) return res.status(400).json({ message: "incorrect query string" });

    // 인증
    const currentStage = `/vts/init?additional=${additional}`;
    const nextStage = additional ? `/vts/init?additional=${!additional}` : `/vts/first?additional=${!additional}`;

    const agent = VTS.what;
    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);

    if (additional) {
      let context = JSON.parse(await redisClient.get(sessionID));
      const chat = { id: context.length + 1, human: user, ai: agent };
      context.push(chat);
      await redisClient.set(sessionID, JSON.stringify(context));

      const contents = { agent };
      if (lang === "ko" && translatedText) {
        user = res.locals.original;
        contents.agent = VTS.whatKorean;
        console.log("응답 보내기 전 : 한글 -> 영어");
      }
      return res.status(200).json({
        message: "vts introduce success, please agree with starting to vts session",
        user,
        contents,
        currentStage,
        nextStage,
      });
    } else {
      const agent = "thank you for agreeing";
      let context = JSON.parse(await redisClient.get(sessionID));
      const chat = { id: context.length + 1, human: user, ai: `${agent} ${VTS.first}` };
      context.push(chat);
      await redisClient.set(sessionID, JSON.stringify(context));

      const contents = { agent };
      if (lang === "ko" && translatedText) {
        user = res.locals.original;
        contents.agent = `동의해 주셔서 감사합니다.`;
        console.log("응답 보내기 전 : 한글 -> 영어");
      }
      return res.status(200).json({
        message: "vts init, reply for first vts question",
        user,
        contents,
        VTS_QUESTION: lang === "ko" && translatedText ? VTS.firstKorean : VTS.first,
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
    const sessionID = `${req.sessionID}`;

    //인증
    const translatedText = res.locals?.translatedText;
    const lang = req.query.lang;
    let user = (lang === "ko" && translatedText) || req.body.user;
    if (!user) return res.status(400).json({ message: "incorrect data" });

    //인증
    let additional;
    if (req.query.additional === "true") additional = true;
    else if (req.query.additional === "false") additional = false;
    if (additional === undefined) return res.status(400).json({ message: "incorrect query string" });

    //인증
    const currentStage = `/vts/first?additional=${additional}`;
    const nextStage = additional ? `/vts/first?additional=${!additional}` : `/vts/second?additional=${!additional}`;

    const data: IData = { user, sessionID };
    user = `The answer to your question is ${user}`;
    if (additional) data.additional = true;
    else data.additional = false;

    const result = await axios.post(`${LLM_SERVER}/talk`, data);

    const agent = result.data?.text;
    const quiz = result.data?.quiz;
    const answer = result.data?.answer;
    const contents = { agent, answer, quiz };

    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);

    if (!additional) {
      let context = JSON.parse(await redisClient.get(sessionID));
      const chat = { id: context.length + 1, human: "", ai: VTS.second };
      context.push(chat);
      await redisClient.set(sessionID, JSON.stringify(context));
    }

    if (lang === "ko" && translatedText) {
      user = res.locals.original;
      const [toggledAgent, toggledAnswer, toggledQuiz] = await Promise.all([
        deeplTranslate(agent, "en"),
        deeplTranslate(answer, "en"),
        deeplTranslate(quiz, "en"),
      ]);
      contents.agent = toggledAgent;
      contents.answer = toggledAnswer;
      contents.quiz = toggledQuiz;
      console.log("응답 보내기 전 : 한글 -> 영어");
    }

    const VTSQuestion = lang === "ko" ? VTS.secondKorean : VTS.second;

    return res.status(200).json({
      message: additional
        ? "reply for additional question"
        : "first additional question end. reply for second VTS session question",
      user,
      contents,
      VTS_QUESTION: !additional && VTSQuestion,
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
    const sessionID = `${req.sessionID}`;

    const translatedText = res.locals?.translatedText;
    const lang = req.query.lang;
    let user = (lang === "ko" && translatedText) || req.body.user;
    if (!user) return res.status(400).json({ message: "incorrect data" });

    // 인증
    let additional;
    if (req.query.additional === "true") additional = true;
    else if (req.query.additional === "false") additional = false;
    if (additional === undefined) return res.status(400).json({ message: "incorrect query string" });

    // 인증
    const currentStage = `/vts/second?additional=${additional}`;
    const nextStage = additional ? `/vts/second?additional=${!additional}` : `/vts/third?additional=${!additional}`;

    const data: IData = { user, sessionID };
    user = `The answer to your question is ${user}`;
    if (additional) data.additional = true;
    else data.additional = false;

    const result: AxiosResponse = await axios.post(`${LLM_SERVER}/talk`, data);
    const agent = result.data?.text;
    const quiz = result.data?.quiz;
    const answer = result.data?.answer;
    const contents = { agent, answer, quiz };

    if (!additional) {
      session.user.secondDone = true;
      let context = JSON.parse(await redisClient.get(sessionID));
      const chat = { id: context.length + 1, human: "", ai: VTS.third };
      context.push(chat);
      await redisClient.set(sessionID, JSON.stringify(context));
    }

    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);

    if (lang === "ko" && translatedText) {
      user = res.locals.original;
      const [toggledAgent, toggledAnswer, toggledQuiz] = await Promise.all([
        deeplTranslate(agent, "en"),
        deeplTranslate(answer, "en"),
        deeplTranslate(quiz, "en"),
      ]);
      contents.agent = toggledAgent;
      contents.answer = toggledAnswer;
      contents.quiz = toggledQuiz;
      console.log("응답 보내기 전 : 한글 -> 영어");
    }

    const VTSQuestion = lang === "ko" ? VTS.thirdKorean : VTS.third;

    return res.status(200).json({
      message: additional ? "reply for additional question" : "additional question end. reply for third VTS quesiton",
      user,
      contents,
      VTS_QUESTION: !additional && VTSQuestion,
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
    const sessionID = `${req.sessionID}`;

    //인증
    const translatedText = res.locals?.translatedText;
    const lang = req.query.lang;
    let user = (lang === "ko" && translatedText) || req.body.user;
    if (!user) return res.status(400).json({ message: "incorrect data" });

    //인증
    let additional;
    if (req.query.additional === "true") additional = true;
    else if (req.query.additional === "false") additional = false;
    if (additional === undefined) return res.status(400).json({ message: "incorrect query string" });

    //인증
    const currentStage = `/vts/third?additional=${additional}`;
    const nextStage = additional ? `/vts/third?additional=${!additional}` : `/vts/end?additional=false`;

    const data: IData = { user, sessionID };
    user = `The answer to your question is ${user}`;
    if (additional) data.additional = true;
    else data.additional = false;
    const result: AxiosResponse = await axios.post(`${LLM_SERVER}/talk`, data);

    const agent = result.data?.text;
    const quiz = result.data?.quiz;
    const answer = result.data?.answer;
    const contents = { agent, answer, quiz };

    if (!additional) {
      session.user.thirdDone = true;
      const context = JSON.parse(await redisClient.get(sessionID));
      const chat = { id: context.length + 1, human: "", ai: VTS.evaluate };
      context.push(chat);
      await redisClient.set(sessionID, JSON.stringify(context));
    }

    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);

    if (lang === "ko" && translatedText) {
      user = res.locals.original;
      const [toggledAgent, toggledAnswer, toggledQuiz] = await Promise.all([
        deeplTranslate(agent, "en"),
        deeplTranslate(answer, "en"),
        deeplTranslate(quiz, "en"),
      ]);
      contents.agent = toggledAgent;
      contents.answer = toggledAnswer;
      contents.quiz = toggledQuiz;
      console.log("응답 보내기 전 : 한글 -> 영어");
    }

    const VTSQuestion = lang === "ko" ? VTS.evaluateKorean : VTS.evaluate;

    return res.status(200).json({
      message: additional ? "reply for third additional question" : "VTS session end",
      user,
      contents,
      VTS_QUESTION: !additional && VTSQuestion,
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
    const sessionID = `${req.sessionID}`;

    const translatedText = res.locals?.translatedText;
    const lang = req.query.lang;
    let user = (lang === "ko" && translatedText) || req.body.user;
    if (!user) return res.status(400).json({ message: "incorrect data" });

    // 인증
    let additional;
    if (req.query.additional === "true") additional = true;
    else if (req.query.additional === "false") additional = false;
    if (additional === undefined) return res.status(400).json({ message: "incorrect query string" });

    const data: IData = { user, sessionID, done: true, additional };
    const result: AxiosResponse = await axios.post(`${LLM_SERVER}/talk`, data);

    const agent = result.data?.text;
    const quiz = result.data?.quiz;
    const answer = result.data?.answer;
    const contents = { agent, answer, quiz };

    const currentStage = `/vts/end?additional=false`;
    const nextStage = `/vts/end?additional=true`;

    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);

    if (lang === "ko" && translatedText) {
      user = res.locals.original;
      const [toggledAgent, toggledAnswer, toggledQuiz] = await Promise.all([
        deeplTranslate(agent, "en"),
        deeplTranslate(answer, "en"),
        deeplTranslate(quiz, "en"),
      ]);
      contents.agent = toggledAgent;
      contents.answer = toggledAnswer;
      contents.quiz = toggledQuiz;
      console.log("응답 보내기 전 : 한글 -> 영어");
    }

    return res.status(200).json({
      message: "Thank you for participating in the evaluation.",
      user,
      contents,
      currentStage,
      nextStage,
    });
  } catch (e) {
    next(e);
  }
};

/**
 * 문장 번역 요청을 위한 translate api 요청 경로
 * @param req
 * @param res
 * @param next
 * @returns
 */

export const postTranslate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sourceLang = req.query.lang as string;
    const text = req.body.text;
    const translatedText = await deeplTranslate(text, sourceLang);

    return res.status(200).json({
      message: "Translation complete.",
      translatedText,
    });
  } catch (e) {
    next(e);
  }
};

export const postTextToSpeech = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const text = req.body.text;
    const voice = req.body.voice;
    const decodedAudio = await clovaTextToSpeech(text, voice);

    return res.status(200).json({
      message: "Speech-to-text complete.",
      decodedAudio,
    });
  } catch (e) {
    next(e);
  }
};
