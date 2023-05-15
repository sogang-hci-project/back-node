import express from "express";
import { postSessionGreeting, postVTSInit, postVTSFirst } from "~/controllers";
import { isSessionInit } from "~/lib/middlewares";

const postRouter = express.Router();

postRouter.post("/session/greeting", isSessionInit, postSessionGreeting);
postRouter.post("/vts/init", isSessionInit, postVTSInit);
postRouter.post("/vts/first", isSessionInit, postVTSFirst);

export default postRouter;
