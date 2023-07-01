import {
  VTS,
  getAnswerWithVectorDBPrompt,
  getParaphrasePrompt,
  getRelatedQuestionPrompt,
  getAdditionalQuestion,
} from "~/constants";
import { chainInitializer, redisClient } from "~/lib";
import { UserSession } from "~/types";

interface Props {
  sessionID?: string;
  session?: UserSession;
  lang?: string;
  user?: string;
  id?: string;
}

/**
 * question 1 : paraphrase
 * question 2 : related question
 * question 3 : actual answer for user's input
 * @return Q 1,2,3 + VTS question 2
 */
export const returnVTS_two = async ({ sessionID, user }: Props) => {
  try {
    // get context
    let context = JSON.parse(await redisClient.get(`context:${sessionID}`));
    if (!context) context = [];
    const chat = { id: context.length + 1, human: user, ai: `` };
    context.push(chat);
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    // LLM init
    const chainWithVectorDB = await chainInitializer({ free: false });
    const { prompt: paraphrasePrompt } = getParaphrasePrompt({ user });
    const { prompt: relatedQuestionPrompt } = getRelatedQuestionPrompt({ user });
    const { prompt: answerWithVectorDBPrompt } = getAnswerWithVectorDBPrompt({
      context: JSON.stringify(context),
    });

    const result = await Promise.all([
      chainWithVectorDB.call({ query: JSON.stringify(paraphrasePrompt) }),
      chainWithVectorDB.call({ query: JSON.stringify(relatedQuestionPrompt) }),
      chainWithVectorDB.call({ query: JSON.stringify(answerWithVectorDBPrompt) }),
    ]);

    const agent = `${result[0].text}${result[1].text}${result[2].text}${VTS.VTS_TWO_EN}`;

    // update context
    context[context.length - 1].ai = agent;
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    return { agent };
  } catch (e) {
    console.error("🔥 return VTS two question error 🔥", e);
  }
};

/**
 * question 1 : paraphrase
 * question 2 : related question
 * question 3 : actual answer for user's input
 * @return Q 1,2,3 + VTS question 3
 */
export const returnVTS_three = async ({ sessionID, user }: Props) => {
  try {
    // get context
    let context = JSON.parse(await redisClient.get(`context:${sessionID}`));
    if (!context) context = [];
    const chat = { id: context.length + 1, human: user, ai: `` };
    context.push(chat);
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    // LLM init
    const chainWithVectorDB = await chainInitializer({ free: false });
    const { prompt: paraphrasePrompt } = getParaphrasePrompt({ user });
    const { prompt: relatedQuestionPrompt } = getRelatedQuestionPrompt({ user });
    const { prompt: answerWithVectorDBPrompt } = getAnswerWithVectorDBPrompt({
      context: JSON.stringify(context),
    });

    const result = await Promise.all([
      chainWithVectorDB.call({ query: JSON.stringify(paraphrasePrompt) }),
      chainWithVectorDB.call({ query: JSON.stringify(relatedQuestionPrompt) }),
      chainWithVectorDB.call({ query: JSON.stringify(answerWithVectorDBPrompt) }),
    ]);

    const agent = `${result[0].text}${result[1].text}${result[2].text}${VTS.VTS_TWO_EN}`;

    // update context
    context[context.length - 1].ai = agent;
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    return { agent };
  } catch (e) {
    console.error("🔥return VTS three question error🔥", e);
  }
};

/**
 * question 1 : paraphrase
 * question 2 : related question
 * question 3 : actual answer for user's input
 * @return question 1,2,3
 */

export const returnAdditionalQuestion = async ({ sessionID, user }: Props) => {
  try {
    // get context
    let context = JSON.parse(await redisClient.get(`context:${sessionID}`));
    if (!context) context = [];
    const chat = { id: context.length + 1, human: user, ai: `` };
    context.push(chat);
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    // LLM init
    const chainWithVectorDB = await chainInitializer({ free: false });
    const { prompt: paraphrasePrompt } = getParaphrasePrompt({ user });
    const { prompt: relatedQuestionPrompt } = getRelatedQuestionPrompt({ user });
    const { prompt: answerWithVectorDBPrompt } = getAnswerWithVectorDBPrompt({
      context: JSON.stringify(context),
      quiz: true,
    });
    const { prompt: additionalQuestionPrompt } = getAdditionalQuestion({ context });

    const result = await Promise.all([
      chainWithVectorDB.call({ query: JSON.stringify(paraphrasePrompt) }),
      chainWithVectorDB.call({ query: JSON.stringify(relatedQuestionPrompt) }),
      chainWithVectorDB.call({ query: JSON.stringify(answerWithVectorDBPrompt) }),
      chainWithVectorDB.call({ query: JSON.stringify(additionalQuestionPrompt) }),
    ]);

    const agent = `${result[0].text}${result[1].text}${result[2].text}${result[3].text}`;
    return { agent };
  } catch (e) {
    console.error("🔥return additional question error🔥", e);
  }
};
