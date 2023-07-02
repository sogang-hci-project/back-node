import dotenv from "dotenv";
dotenv.config();

export const LLM_SERVER = process.env.LLM_SERVER;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const DATA_STORE_PATH = `${__dirname}/../data_store`;
