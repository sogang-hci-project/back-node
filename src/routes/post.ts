import express from "express";
import { postSessionGreeting, postVTSInit } from "~/controllers";
import { isSessionInit } from "~/lib/middlewares";

const postRouter = express.Router();

postRouter.post("/session/greeting", isSessionInit, postSessionGreeting);
postRouter.post("/vts/init", isSessionInit, postVTSInit);

export default postRouter;
