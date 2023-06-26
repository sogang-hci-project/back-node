import { paraphrasePrompt, relatedQuestionPrompt } from "~/constants";
import { redisClient, chainInitializer } from "~/lib";
import { extractText, fetchOpenAI, generateQuery, handleContext, setContextInRedis } from "~/utils";

interface IData {
  user: string;
  sessionID?: string;
  additional?: boolean;
  done?: boolean;
}

export const requestLLMApi = async (data: IData) => {
  try {
    const { user, sessionID, additional, done } = data;

    const { context } = await handleContext(sessionID, user);
    const { query } = generateQuery(additional, done, context);
    const { text } = await fetchOpenAI(query);
    await setContextInRedis(sessionID, text, context);
    const { filteredText, answer, quiz } = extractText(text);

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

    const result = await chain.call({ context: JSON.stringify(context) });
    const { text } = result;

    context[context.length - 1]["ai"] = text;

    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));
    return { message: "Free model connect success", text };
  } catch (e) {
    console.error("🔥🔥 error occurs in FREE LLM API function 🔥🔥", e);
  }
};

interface Props {
  user: string;
}

export const requestRelatedAnswer = async ({ user }: Props) => {
  const chain = await chainInitializer({ free: true });
  const { prompt } = relatedQuestionPrompt({ user });
  const data = { prompt };
  const result = await chain.call({ user: JSON.stringify(data) });
  const { text } = result;

  return { text };
};

export const requestParaphrase = async ({ user }: Props) => {
  const chain = await chainInitializer({ free: true });
  const { prompt } = paraphrasePrompt({ user });

  const data = { prompt };
  const result = await chain.call({ user: JSON.stringify(data) });
  const { text } = result;

  return { text };
};
