import { NextFunction, Request, Response } from "express";
import { ConversationResponse } from "~/types";

export const conversation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data: ConversationResponse = {};
  } catch (e) {
    console.error("", e);
  }
};
