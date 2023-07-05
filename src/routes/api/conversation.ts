import express from "express";
import { conversation } from "~/controllers";
import { addSession, finalTranslation, initTranslation } from "~/middlewares";

const conversationRouter = express.Router();

conversationRouter.post("/conversation/:id", addSession, initTranslation, conversation, finalTranslation);

export default conversationRouter;
