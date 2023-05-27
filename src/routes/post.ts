import express from "express";
import { postSessionGreeting, postVTSInit, postVTSFirst, postVTSSecond, postVTSThird, postVTSEnd } from "~/controllers";
import { isSessionInit } from "~/lib/middlewares";

const postRouter = express.Router();

postRouter.post("/session/greeting", isSessionInit, postSessionGreeting);
postRouter.post("/vts/init", isSessionInit, postVTSInit);
postRouter.post("/vts/first", isSessionInit, postVTSFirst);
postRouter.post("/vts/second", isSessionInit, postVTSSecond);
postRouter.post("/vts/third", isSessionInit, postVTSThird);
postRouter.post("/vts/end", isSessionInit, postVTSEnd);

export default postRouter;
