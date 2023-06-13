import { chainInitializer, redisClient } from "~/lib";
import { dbTemplate, dbTemplateDone, dbTemplateNoQuiz, dbTemplateQA } from "~/constants";

export function extractText(text: string) {
  // Pablo Picasso: 가 포함된 경우 이를 제거
  const filteredText = text.replace(/Pablo Picasso:/, "");

  // Response: 뒤에 있는 문장 추출
  const responseRegex = /Response:\s*(.*)/;
  const responseMatch = filteredText.match(responseRegex);
  const answer = responseMatch && responseMatch[1];

  // Question: 뒤에 있는 문장 추출
  const questionRegex = /Question:\s*(.*)/;
  const questionMatch = filteredText.match(questionRegex);
  const quiz = questionMatch && questionMatch[1];

  return { filteredText, answer, quiz };
}

interface IContext {
  human: string;
  ai: string;
  id: number;
}

export async function handleContext(sessionID: string, user: string) {
  let context = JSON.parse(await redisClient.get(`context:${sessionID}`));
  if (!context) context = [];
  let chat = { id: context.length + 1, human: user, ai: "" };
  context.push(chat);
  const modifiedContext = context.map(({ human, ai, id }: IContext) => {
    return { id, user: human, picasso: ai };
  });
  return { context: modifiedContext };
}

export function generateQuery(additional?: boolean, done?: boolean) {
  let query;
  if (done) {
    query = `${additional ? dbTemplateQA : dbTemplateDone}\n${JSON.stringify(context)}`;
  } else {
    query = `${additional ? dbTemplate : dbTemplateNoQuiz}\n${JSON.stringify(context)}`;
  }

  return { query };
}

export async function fetchOpenAI(query: string) {
  let text;
  const chain = await chainInitializer({ free: false });
  const result = await chain.call({
    query,
  });
  text = result?.text;
  return { text };
}
