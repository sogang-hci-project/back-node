import express from "express";
import { greeting } from "~/controllers";
import { addSession, translation } from "~/middlewares";

const greetingRouter = express.Router();

greetingRouter.post("/greeting/:id", addSession, translation, greeting);

export default greetingRouter;
