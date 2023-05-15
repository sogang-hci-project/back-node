import express from "express";
import {
  postSessionGreeting,
  postVTSInit,
  postVTSFirst,
  postVTSSecond,
  postVTSThird,
  postVTSEnd,
  postQNA,
} from "~/controllers";
import { isSessionInit } from "~/lib/middlewares";

const postRouter = express.Router();

postRouter.post("/session/greeting", isSessionInit, postSessionGreeting);
postRouter.post("/vts/init", isSessionInit, postVTSInit);
postRouter.post("/vts/first", isSessionInit, postVTSFirst);
postRouter.post("/vts/second", isSessionInit, postVTSSecond);
postRouter.post("/vts/third", isSessionInit, postVTSThird);
postRouter.post("/vts/end", isSessionInit, postVTSEnd);

postRouter.post("/qna", isSessionInit, postQNA);

export default postRouter;
