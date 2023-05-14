import axios, { AxiosResponse } from "axios";
import { Request, Response, NextFunction } from "express";

export const postPaintingInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question } = req.body;
    const result: AxiosResponse = await axios.post("http://127.0.0.1:5000/hello", { question });
    const contents = result.data;
    res.status(200).json({ message: "success", contents });
  } catch (e) {
    console.error("에러가 발생", e);
    next(e);
  }
};

export const postGreeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // {question} = req.body
  } catch (e) {
    next();
  }
};
