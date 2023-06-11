import express from "express";
import {
  postSessionGreeting,
  postVTSInit,
  postVTSFirst,
  postVTSSecond,
  postVTSThird,
  postVTSEnd,
  postTranslate,
  postTextToSpeech,
} from "~/controllers";
import { addSession, translation } from "~/lib/middlewares";

const postRouter = express.Router();

postRouter.post("/session/greeting", addSession, translation, postSessionGreeting);
postRouter.post("/vts/init", addSession, translation, postVTSInit);
postRouter.post("/vts/first", addSession, translation, postVTSFirst);
postRouter.post("/vts/second", addSession, translation, postVTSSecond);
postRouter.post("/vts/third", addSession, translation, postVTSThird);
postRouter.post("/vts/end", addSession, translation, postVTSEnd);
postRouter.post("/util/translate", postTranslate);
postRouter.post("/util/texttospeech", postTextToSpeech);

export default postRouter;
