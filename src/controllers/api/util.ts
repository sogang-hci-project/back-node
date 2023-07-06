import { NextFunction, Request, Response } from "express";
import { deeplTranslate, clovaTextToSpeech } from "~/lib";

/**
 * 문장 번역 요청을 위한 translate api 요청 경로
 * @param req
 * @param res
 * @param next
 * @returns
 */

export const handleTranslate = async (req: Request, res: Response, next: NextFunction) => {
  console.log("translate rquest");
  try {
    const sourceLang = req.query.lang as string;
    const text = req.body.text;
    const translatedText = await deeplTranslate(text, sourceLang);

    return res.status(200).json({
      message: "Translation complete.",
      translatedText,
    });
  } catch (e) {
    console.error("🔥 util controller error occur 🔥", e);
    next(e);
  }
};

export const handleTextToSpeech = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const text = req.body.text;
    const voice = req.body.voice;
    const decodedAudio = await clovaTextToSpeech(text, voice);

    return res.status(200).json({
      message: "Speech-to-text complete.",
      decodedAudio,
    });
  } catch (e) {
    console.error("🔥 util controller error occur 🔥", e);
    next(e);
  }
};
