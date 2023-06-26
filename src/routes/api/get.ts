import express from "express";
import { get } from "http";
import { getInitSession, getPreInitSession, greeting } from "~/controllers";
import { addSession } from "~/middlewares";

const getRouter = express.Router();

getRouter.get("/session/init", getInitSession);
getRouter.get("/session/pre", addSession, getPreInitSession);

export default getRouter;
