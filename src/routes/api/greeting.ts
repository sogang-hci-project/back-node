import express from "express";
import { greeting } from "~/controllers";
import { addSession, initTranslation } from "~/middlewares";

const greetingRouter = express.Router();

greetingRouter.post("/greeting/:id", addSession, initTranslation, greeting);

export default greetingRouter;
