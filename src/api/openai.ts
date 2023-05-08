const { Configuration, OpenAIApi } = require("openai");
import dotenv from "dotenv";
dotenv.config();

const configiration = new Configuration({
  apiKey: process.env.OPENAI_SECRET_KEY,
});

const openai = new OpenAIApi(configiration);

export const runGPT35 = async (prompt: string) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 50,
  });
  // console.log(response.data.choices[0].message.content);
  return response.data.choices[0].message.content;
};
