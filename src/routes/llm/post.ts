import express from "express";
import { handleChat, handleChatWithFree } from "~/controllers/llm/post";

const router = express.Router();
router.post("/talk", handleChat);
router.post("/talk-with-free", handleChatWithFree);

export default router;
