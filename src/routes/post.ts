import express from "express";
import { postPaintingInfo } from "~/controllers";

const postRouter = express.Router();

postRouter.post("/vts", postPaintingInfo);

export default postRouter;
