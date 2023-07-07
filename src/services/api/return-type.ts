import { MESSAGE } from "~/datas";
import { chainInitializer, redisClient } from "~/lib";
import { getSimilarityWithVTS } from "~/lib/hugging-face";
import {
  getAdditionalQuestionPrompt,
  getAnswerWithVectorDBPrompt,
  getParaphrasePrompt,
  getRelatedQuestionPrompt,
} from "~/prompts";
import { CHAIN_INIT_TYPE, SIMILARITY_TYPE, UserSession } from "~/types";

interface Props {
  sessionID?: string;
  session?: UserSession;
  lang?: string;
  user?: string;
  id?: string;
}

interface IsAnsweredProps {
  previousQuestion: string;
  answer: string;
}

interface IsQuestionProps {
  sentences: string;
}

const example = [
  { isQuestion: false, rest: [""] }, // if isQuestion === true , rest : [sentence1, sentence2, ... ]
  {
    isAnswer: false,
    reason: "The sentence below '---' does not provide any information about the previous question.",
  },
  { text: "I didn't quite understand." },
  { text: '[false, "nothing"]' },
  { text: "---" },
];

type typeOfResult = typeof example;

interface getAgentFullSentenceProps {
  result: typeOfResult;
  secondVTS?: boolean;
  thirdVTS?: boolean;
}

export const getAgentFullSentence = async ({ result, secondVTS, thirdVTS }: getAgentFullSentenceProps) => {
  let agent = "";
  // 응답이 잘못 생성되는 경우를 고려하여 default value 지정
  const isQuestion = (() => {
    try {
      return result?.[0].isQuestion;
    } catch (e) {
      return false;
    }
  })();

  const isAnswer = result?.[1];
  // TODO : regenerate answer for final experiment?
  if (isQuestion) {
  }

  // TODO : ask again for final experiment?
  if (!isAnswer) {
  }

  const paraphrased = result?.[2]?.text === `I didn't quite understand.` ? "" : result?.[2]?.text;

  // 이부분이 내가 원래 해뒀던 방식이랑 출력 값이 달라지면서 생긴 에러인데, 우선 주석 처리해서 넘어가고 배포한 담에 프론트랑 연결하고 TODO 찍고 넘어가자.
  // 이제 수정하더라도 이 함수만 수정하면 모든 라우터에 다 적용돼서 별로 안 어려울듯.
  // TODO : refine output structure
  // const relatedQuestion =
  //   result?.[3]?.text && !!JSON.parse(result?.[3]?.text)[0] ? JSON.parse(result?.[3]?.text)[1] : "";
  // const regex = /Picasso:\s(.+)/;
  // const answer = result?.[4]?.text?.match(regex)?.[1];
  const relatedQuestion = result?.[3]?.text;
  const answer = isQuestion ? result?.[4].text : "";
  const addiontionalQuestion = result?.[5] ? result?.[5]?.text : "";

  agent += paraphrased + " ";
  agent += relatedQuestion + " ";
  // agent += !!relatedQuestion && `Someone had a similar answer before.`;
  // agent += answer + " ";
  agent += addiontionalQuestion;

  console.log("■■■■■■■■■[GENERATION RESULT]■■■■■■■■■\n", result);
  console.log("■■■■■■■■■[PARAPHRASE RESULT]■■■■■■■■■\n", paraphrased);
  console.log("■■■■■■■■■[LINKING RESULT]■■■■■■■■■\n", relatedQuestion);
  isQuestion && console.log("■■■■■■■■■[QUESTION ANSWER RESULT]■■■■■■■■■\n", answer);
  addiontionalQuestion && console.log("■■■■■■■■■[ADDITIONAL QUESTION RESULT]■■■■■■■■■\n", addiontionalQuestion);

  const chainWithVectorDB = await chainInitializer({});
  agent = (
    await chainWithVectorDB.call({
      query: `
      Refine following message to add congruency between sentences. Fix the minimum amount.

      ${agent}
  `,
    })
  ).text;

  if (secondVTS) agent = agent + " " + MESSAGE.VTS_TWO_EN;
  if (thirdVTS) agent = agent + " " + MESSAGE.VTS_THREE_EN;

  console.log("■■■■■■■■■[FINAL RESULT]■■■■■■■■■\n", agent);

  return { agent };
};

/**
 *
 * @returns isAnswer:boolean, reason:string
 */

export async function getIsAnswered({ previousQuestion, answer }: IsAnsweredProps) {
  try {
    const chain = await chainInitializer({ type: CHAIN_INIT_TYPE.ANSWER, sentences: previousQuestion });
    const [isAnswer, reason] = JSON.parse((await chain.call({ sentences: answer }))?.text);

    return { isAnswer, reason };
  } catch (e) {
    console.error("🔥 isAnswered function error 🔥", e);
  }
}

/**
 *
 * @returns isQuestion:boolean, rest : string[]
 */

export async function getIsQuestion({ sentences }: IsQuestionProps) {
  try {
    const chain = await chainInitializer({ type: CHAIN_INIT_TYPE.QUESTION, sentences });
    const [isQuestion, ...rest] = JSON.parse((await chain.call({ sentences })).text);
    return { isQuestion, rest };
  } catch (e) {
    console.error("🔥 getIsQuestion error 🔥");
  }
}

/**
 *
 * @returns context, all records of previous conversation
 */

const getContext = async ({ sessionID, user }: Props) => {
  try {
    let context = JSON.parse(await redisClient.get(`context:${sessionID}`));
    if (!context) context = [];
    const previousQuestion = context[context.length - 1].ai;
    const answer = user;
    const chat = { id: context.length + 1, human: user, ai: `` };
    context.push(chat);
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));
    return { context, previousQuestion, answer };
  } catch (e) {
    console.error("🔥 getContext function error 🔥", e);
  }
};

/**
 * question 1 : paraphrase
 * question 2 : related question
 * question 3 : actual answer for user's input
 * @return Q 1,2,3 + VTS question 2
 */
export const returnVTS_two = async ({ sessionID, user }: Props) => {
  try {
    // get context
    const { context, previousQuestion, answer } = await getContext({ sessionID, user });

    // LLM init
    const chainWithVectorDB = await chainInitializer({});
    const { prompt: paraphrasePrompt } = getParaphrasePrompt({ user, previousQuestion });
    const { prompt: relatedQuestionPrompt } = getRelatedQuestionPrompt({ user, previousQuestion });
    const { prompt: answerWithVectorDBPrompt } = getAnswerWithVectorDBPrompt({
      user,
    });

    const result = await Promise.all([
      getIsQuestion({ sentences: user }),
      getIsAnswered({ previousQuestion, answer }),
      chainWithVectorDB.call({ query: JSON.stringify(paraphrasePrompt) }),
      chainWithVectorDB.call({ query: JSON.stringify(relatedQuestionPrompt) }),
      chainWithVectorDB.call({ query: JSON.stringify(answerWithVectorDBPrompt) }),
    ]);

    const { agent } = await getAgentFullSentence({ result: result as any, secondVTS: true });

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
    const { context, previousQuestion, answer } = await getContext({ sessionID, user });

    // LLM init
    const chainWithVectorDB = await chainInitializer({ type: CHAIN_INIT_TYPE.VECTOR });
    const { prompt: paraphrasePrompt } = getParaphrasePrompt({ user, previousQuestion });
    const { prompt: relatedQuestionPrompt } = getRelatedQuestionPrompt({ user, previousQuestion });
    const { prompt: answerWithVectorDBPrompt } = getAnswerWithVectorDBPrompt({
      user,
    });

    const result = await Promise.all([
      getIsQuestion({ sentences: user }),
      getIsAnswered({ previousQuestion, answer }),
      chainWithVectorDB.call({ query: JSON.stringify(paraphrasePrompt) }),
      chainWithVectorDB.call({ query: JSON.stringify(relatedQuestionPrompt) }),
      chainWithVectorDB.call({ query: JSON.stringify(answerWithVectorDBPrompt) }),
    ]);

    const { agent } = await getAgentFullSentence({ result: result as any, thirdVTS: true });

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
 * @return question 1,2,3 + additional Question
 */

export const returnAdditionalQuestion = async ({ sessionID, user }: Props) => {
  try {
    // get context
    const { context, previousQuestion, answer } = await getContext({ sessionID, user });

    // LLM init
    const chainWithVectorDB = await chainInitializer({ type: CHAIN_INIT_TYPE.VECTOR });
    const { prompt: paraphrasePrompt } = getParaphrasePrompt({ user, previousQuestion });
    const { prompt: relatedQuestionPrompt } = getRelatedQuestionPrompt({ user, previousQuestion });
    const { prompt: answerWithVectorDBPrompt } = getAnswerWithVectorDBPrompt({
      user,
    });
    const { prompt: additionalQuestionPrompt } = getAdditionalQuestionPrompt({ user, previousQuestion });

    const result = await Promise.all([
      getIsQuestion({ sentences: user }),
      getIsAnswered({ previousQuestion, answer }),
      chainWithVectorDB.call({ query: JSON.stringify(paraphrasePrompt) }),
      chainWithVectorDB.call({ query: JSON.stringify(relatedQuestionPrompt) }),
      chainWithVectorDB.call({ query: JSON.stringify(answerWithVectorDBPrompt) }),
      chainWithVectorDB.call({ query: JSON.stringify(additionalQuestionPrompt) }),
    ]);

    // [잦은 오류 발생으로 주석 처리]
    // console.log("여기까지 확인1", result);

    // TODO : Add logic
    //console.log("🔥🔥 질문이 있는지 확인 🔥🔥 \n", result[4]);
    //console.log("🔥🔥 답변을 했는지 확인 🔥🔥\n ", result[5]);

    // let additionalQuestion = result?.[5].text; // actual data

    // console.log("🔥🔥 유사도 검증 전 추가 질문 내용 확인🔥🔥 \n", additionalQuestion);
    // console.log("\n");

    // let again = 0;
    // while (true) {
    //   let sourceSentence;
    //   if (!!again) {
    //     sourceSentence = (await chainWithVectorDB.call({ query: JSON.stringify(additionalQuestionPrompt) })).text;
    //     console.log(` 🔥🔥${again} 번째 유사도 검증 루프 시작 🔥🔥 \n `);
    //   } else sourceSentence = additionalQuestion;
    //   const [similarity] = await getSimilarityWithVTS({
    //     type: SIMILARITY_TYPE.WITH_VTS_TWO,
    //     sourceSentence,
    //   });
    //   console.log("🔥🔥 similarity 🔥🔥\n", similarity);
    //   console.log("\n");
    //   if (similarity > 0.9 && !again) {
    //     again += 1;
    //     continue;
    //   } else {
    //     additionalQuestion = sourceSentence;
    //     break;
    //   }
    // }
    // console.log("여기까지 확인2", result);

    // console.log("🔥🔥 유사도 검증 후 추가 질문 내용 확인🔥🔥 \n", additionalQuestion);
    // console.log("\n");

    const { agent } = await getAgentFullSentence({ result: result as any });
    // console.log("최종 답", agent);
    // console.log("유사 질문", additionalQuestion);
    context[context.length - 1].ai = agent;
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    return { agent };
  } catch (e) {
    console.error("🔥return additional question error🔥", e);
  }
};

// VTS_TWO_EN: `What else can you find in the painting?`,
// let additionalQuestion = "What else can you find in the painting?"; // similarity is 1.00
// let additionalQuestion = "What can you find in the paintings?"; // similarity is 0.88
// let additionalQuestion = "What can you find in the city?"; // similarity is 0.45
