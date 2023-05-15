import express from "express";
import { postSessionGreeting } from "~/controllers";
import { isSessionInit } from "~/lib/middlewares";

const postRouter = express.Router();

postRouter.post("/session/greeting", isSessionInit, postSessionGreeting);

export default postRouter;
