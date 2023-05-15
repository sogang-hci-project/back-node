import express from "express";
import { getInitSession } from "~/controllers";

const getRouter = express.Router();

getRouter.get("/session/init", getInitSession);

export default getRouter;
