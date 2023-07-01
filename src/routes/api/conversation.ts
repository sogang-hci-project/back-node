import express from "express";
import { conversation } from "~/controllers";
import { addSession, finalTranslation, translation } from "~/middlewares";

const conversationRouter = express.Router();

conversationRouter.post("/conversation/:id", addSession, translation, conversation, finalTranslation);

export default conversationRouter;
