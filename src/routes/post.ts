import express from "express";
import { postSessionGreeting, postVTSInit, postVTSFirst, postVTSSecond, postVTSThird, postVTSEnd } from "~/controllers";
import { addSession, isSessionInit } from "~/lib/middlewares";

const postRouter = express.Router();

postRouter.post("/session/greeting", addSession, postSessionGreeting);
postRouter.post("/vts/init", addSession, postVTSInit);
postRouter.post("/vts/first", addSession, postVTSFirst);
postRouter.post("/vts/second", addSession, postVTSSecond);
postRouter.post("/vts/third", addSession, postVTSThird);
postRouter.post("/vts/end", addSession, postVTSEnd);

export default postRouter;
