import { SIMILARITY_TYPE } from "~/constants";
import { MESSAGE } from "~/datas";
import { chainInitializer, redisClient } from "~/lib";
import { getSimilarityWithVTS } from "~/lib/hugging-face";
import {
  getAdditionalQuestion,
  getAnswerWithVectorDBPrompt,
  getParaphrasePrompt,
  getRelatedQuestionPrompt,
} from "~/prompts";
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
    const chainWithVectorDB = await chainInitializer({});
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

    const agent = `${result[0].text}${result[1].text}${result[2].text}${MESSAGE.VTS_TWO_EN}`;

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
    const chainWithVectorDB = await chainInitializer({});
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

    const agent = `${result[0].text}${result[1].text}${result[2].text}${MESSAGE.VTS_THREE_EN}`;

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
    const chainWithVectorDB = await chainInitializer({});
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

    // VTS_TWO_EN: `What else can you find in the painting?`,
    // let additionalQuestion = "What else can you find in the painting?"; // similarity is 1.00
    // let additionalQuestion = "What can you find in the paintings?"; // similarity is 0.88
    // let additionalQuestion = "What can you find in the city?"; // similarity is 0.45
    let additionalQuestion = result?.[3].text; // actual data

    console.log("🔥🔥 유사도 검증 전 추가 질문 내용 확인🔥🔥 \n", additionalQuestion);
    console.log("\n");

    let again = 0;
    while (true) {
      let sourceSentence;
      if (!!again) {
        sourceSentence = (await chainWithVectorDB.call({ query: JSON.stringify(additionalQuestionPrompt) })).text;
        console.log(` 🔥🔥${again} 번째 유사도 검증 루프 시작 🔥🔥 \n `);
      } else sourceSentence = additionalQuestion;
      const [similarity] = await getSimilarityWithVTS({
        type: SIMILARITY_TYPE.WITH_VTS_TWO,
        sourceSentence,
      });
      console.log("🔥🔥 similarity 🔥🔥\n", similarity);
      console.log("\n");
      if (similarity > 0.9 && !again) {
        again += 1;
        continue;
      } else {
        additionalQuestion = sourceSentence;
        break;
      }
    }

    console.log("🔥🔥 유사도 검증 후 추가 질문 내용 확인🔥🔥 \n", additionalQuestion);
    console.log("\n");

    const agent = `${result[0].text}${result[1].text}${result[2].text}${result[3].text}`;
    context[context.length - 1].ai = agent;
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    return { agent };
  } catch (e) {
    console.error("🔥return additional question error🔥", e);
  }
};
