import { chainInitializer, redisClient } from "~/lib";

interface IData {
  user: string;
  sessionID?: string;
  additional?: boolean;
  done?: boolean;
}

export const requestFreeLLMApi = async (data: IData) => {
  try {
    const chain = await chainInitializer({ free: true });
    const { user, sessionID } = data;

    let context = JSON.parse(await redisClient.get(sessionID));
    if (!context) context = [];

    let chat = { id: context.length + 1, human: user, ai: "" };
    context.push(chat);

    const result = await chain.call({ user: JSON.stringify(context) });
    const { text } = result;

    context[context.length - 1]["ai"] = text;

    await redisClient.set(sessionID, JSON.stringify(context));
    return { message: "Free model connect success", text };
  } catch (e) {
    console.error("", e);
  }
};
