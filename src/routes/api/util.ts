import express from "express";
import { handleTextToSpeech, handleTranslate } from "~/controllers";

const utilRouter = express.Router();

utilRouter.post("/util/translate", handleTranslate);
utilRouter.post("/util/texttospeech", handleTextToSpeech);

export default utilRouter;
