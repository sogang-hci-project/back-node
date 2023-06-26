import express from "express";
import { greeting } from "~/controllers";
import { addSession } from "~/middlewares";

const greetingRouter = express.Router();

greetingRouter.get("/greeting/:id", addSession, greeting);

export default greetingRouter;
