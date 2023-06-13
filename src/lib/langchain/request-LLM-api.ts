import { dbTemplate, dbTemplateDone, dbTemplateNoQuiz, dbTemplateQA } from "~/constants";
import { redisClient, chainInitializer } from "~/lib";

interface IData {
  user: string;
  sessionID?: string;
  additional?: boolean;
  done?: boolean;
}

export const requestLLMApi = async (data: IData) => {
  try {
    const { user, sessionID, additional, done } = data;

    let context = JSON.parse(await redisClient.get(`context:${sessionID}`));
    if (!context) context = [];
    const chat = { id: context.length + 1, human: user, ai: "" };
    context.push(chat);
    const modifiedContext = context.map(({ human, ai, id }: { human: string; ai: string; id: number }) => {
      return { id, user: human, picasso: ai };
    });

    let query;
    if (done) {
      query = `${additional ? dbTemplateQA : dbTemplateDone}\n${JSON.stringify(modifiedContext)}`;
    } else {
      query = `${additional ? dbTemplate : dbTemplateNoQuiz}\n${JSON.stringify(modifiedContext)}`;
    }

    const chain = await chainInitializer({ free: false });
    const result = await chain.call({
      query,
    });
    const { text } = result;
    context[context.length - 1]["ai"] = text;
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    // 정규식을 사용하여 Pablo Picasso: 가 포함된 경우 이를 제거
    const filteredText = text.replace(/Pablo Picasso:/, "");

    // 정규식을 사용하여 Response: 뒤에 있는 문장 추출
    const responseRegex = /Response:\s*(.*)/;
    const responseMatch = filteredText.match(responseRegex);
    const answer = responseMatch && responseMatch[1];

    // 정규식을 사용하여 Question: 뒤에 있는 문장 추출
    const questionRegex = /Question:\s*(.*)/;
    const questionMatch = filteredText.match(questionRegex);
    const quiz = questionMatch && questionMatch[1];

    return { message: "llm model router test", filteredText, answer, quiz };
  } catch (e) {
    console.error("🔥🔥 error occurs in FREE LLM API function 🔥🔥", e);
  }
};

export const requestFreeLLMApi = async (data: IData) => {
  try {
    const chain = await chainInitializer({ free: true });
    const { user, sessionID } = data;

    let context = JSON.parse(await redisClient.get(`context:${sessionID}`));
    if (!context) context = [];

    let chat = { id: context.length + 1, human: user, ai: "" };
    context.push(chat);

    const result = await chain.call({ user: JSON.stringify(context) });
    const { text } = result;

    context[context.length - 1]["ai"] = text;

    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));
    return { message: "Free model connect success", text };
  } catch (e) {
    console.error("🔥🔥 error occurs in FREE LLM API function 🔥🔥", e);
  }
};
