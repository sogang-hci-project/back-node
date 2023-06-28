// import express from "express";
// import { paraphrasePrompt, relatedQuestionPrompt } from "~/constants";
// import {
//   postSessionGreeting,
//   postVTSInit,
//   postVTSFirst,
//   postVTSSecond,
//   postVTSThird,
//   postVTSEnd,
//   postTranslate,
//   postTextToSpeech,
// } from "~/controllers";
// import { chainInitializer } from "~/lib";
// import { addSession, translation } from "~/middlewares";

// const postRouter = express.Router();

// postRouter.post("/greeting/:id", addSession, translation, (req, res, next) => {
//   return res.status(200).json({ message: "connect success" });
// });
// postRouter.post("/conversation/:id", addSession, translation, (req, res, next) => {
//   return res.status(200).json({ message: "connect success" });
// });
// postRouter.post("/end/:id", addSession, translation, (req, res, next) => {
//   return res.status(200).json({ message: "connect success" });
// });

// postRouter.post("/session/greeting", addSession, translation, postSessionGreeting);
// postRouter.post("/vts/init", addSession, translation, postVTSInit);
// postRouter.post("/vts/first", addSession, translation, postVTSFirst);
// postRouter.post("/vts/second", addSession, translation, postVTSSecond);
// postRouter.post("/vts/third", addSession, translation, postVTSThird);
// postRouter.post("/vts/end", addSession, translation, postVTSEnd);
// postRouter.post("/util/translate", postTranslate);
// postRouter.post("/util/texttospeech", postTextToSpeech);
// postRouter.post("/test", async (req: any, res: any, next: any) => {
//   const { user } = req.body;

//   const chain = await chainInitializer({ free: true });
//   // const { prompt } = paraphrasePrompt({ user });
//   const { prompt } = relatedQuestionPrompt({ user });

//   const data = { prompt };
//   const result = await chain.call({ user: JSON.stringify(data) });
//   const { text } = result;

//   res.json({ message: "success", text });
// });

// export default postRouter;
