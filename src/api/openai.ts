const { Configuration, OpenAIApi } = require("openai");
import dotenv from "dotenv";
dotenv.config();

const configiration = new Configuration({
  apiKey: process.env.OPENAI_SECRET_KEY,
});

const openai = new OpenAIApi(configiration);

const prompt = [{ role: "user", content: 'Translate the following English text to French: "{text}"' }];

const runGPT35 = async (prompt: string) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });
  console.log(response.data.choices[0].message.content);
};

runGPT35("SGU는 언제까지 모집하니?");
