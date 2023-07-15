import { MESSAGE } from "~/datas";
import { redisClient } from "~/lib";
import * as CustomChain from "~/lib/langchain";
import { getSimilarityWithVTS } from "~/lib/hugging-face";
import {
  getAdditionalQuestionPrompt,
  getAnswerWithVectorDBPrompt,
  getAskAgainPrompt,
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
  reply: string;
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

interface agentMessages {
  answer?: string;
  paraphrase?: string;
  link?: string;
  question: string;
}

interface combineAgentMessageProps {
  user: string;
  textContext: string;
  messages: agentMessages;
  secondVTS?: boolean;
  thirdVTS?: boolean;
}

export const combineAgentMessage = async ({ messages, user, textContext }: combineAgentMessageProps) => {
  const answer = messages.answer || "";
  const paraphrase = messages.paraphrase || "";
  const link = messages.link || "";
  const question = messages.question;

  console.log(`
  ■■■■■■■■■[GENERATION RESULT]■■■■■■■■■
  ■■■■■■■■■[USER REPLY]■■■■■■■■■■■■■■■■
  ${user}
  ■■■■■■■■■[AGENT ANSWER TO QUESTION]■■
  ${answer}
  ■■■■■■■■■[PARAPHRASE]■■■■■■■■■■■■■■■■
  ${paraphrase}
  ■■■■■■■■■[LINK]■■■■■■■■■■■■■■■■■■■■■■
  ${link}
  ■■■■■■■■■[NEW QUESTION]■■■■■■■■■■■■■■
  ${question}
  `);

  const chain = await CustomChain.getCombineMessageChain();
  const agent = (
    await chain.call({
      answer,
      paraphrase,
      link,
      question,
      context: textContext,
    })
  ).text;

  console.log("■■■■■■■■■[COMBINE RESULT]■■■■■■■■■\n", agent);

  return { agent };
};

/**
 *
 * @returns isAnswer:boolean, reason:string
 */

export async function getIsAnswer({ previousQuestion, reply }: IsAnsweredProps) {
  try {
    const chain = await CustomChain.getResponseDiscriminatorChain();
    const [isAnswer, reason] = JSON.parse((await chain.call({ sentences: reply, previousQuestion }))?.text);

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
    const chain = await CustomChain.getQuestionDiscriminatorChain();
    const [isQuestion, ...rest] = JSON.parse((await chain.call({ sentences })).text);
    return { isQuestion, rest };
  } catch (e) {
    console.error("🔥 getIsQuestion error 🔥");
  }
}

interface contextItem {
  id: number;
  human: string;
  ai: string;
}

/**
 *
 * @returns context, all records of previous conversation
 */

const getContext = async ({ sessionID, user }: Props) => {
  try {
    const context =
      (JSON.parse(await redisClient.get(`context:${sessionID}`)) as contextItem[]) || new Array<contextItem>();
    const previousQuestion = context[context.length - 1].ai;
    const reply = user;
    const chat: contextItem = { id: context.length + 1, human: user, ai: `` };
    context.push(chat);
    const textContext = context.map((item) => `Student: ${item.human} Picasso: ${item.ai} \n`).join("");
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));
    return { context, textContext, previousQuestion, reply };
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
    // Get context
    const { context, textContext, previousQuestion, reply } = await getContext({ sessionID, user });

    // LLM init
    const chain = await CustomChain.getDefaultChain();
    const { prompt: paraphrasePrompt } = getParaphrasePrompt({ user, previousQuestion });
    const { prompt: relatedQuestionPrompt } = getRelatedQuestionPrompt({ user, previousQuestion });
    const { prompt: answerWithVectorDBPrompt } = getAnswerWithVectorDBPrompt({
      user,
    });
    const { prompt: askAgainPrompt } = getAskAgainPrompt({ user, previousQuestion });

    const [questionResult, answerResult, { text: paraphrase }, { text: link }, { text: answer }, { text: inquiry }] =
      await Promise.all([
        getIsQuestion({ sentences: user }),
        getIsAnswer({ previousQuestion, reply }),
        chain.call({ query: JSON.stringify(paraphrasePrompt) }),
        chain.call({ query: JSON.stringify(relatedQuestionPrompt) }),
        chain.call({ query: JSON.stringify(answerWithVectorDBPrompt) }),
        chain.call({ query: JSON.stringify(askAgainPrompt) }),
      ]);

    const isQuestion = questionResult.isQuestion || false;
    const isAnswered = answerResult.isAnswer !== undefined ? answerResult.isAnswer : true;

    console.log(answerResult);

    if (isAnswered === false) {
      console.log(`
        ■■■■■■■■■[USER DID NOT ANSWER]■■■■■■■■■
        Decision Reason: ${answerResult.reason}
        ■■■■■■■■■[ASKING AGAIN]■■■■■■■■■■■■■■■■
        ${inquiry}
      `);
      context[context.length - 1].ai = inquiry;
      await redisClient.set(`context:${sessionID}`, JSON.stringify(context));
      return { agent: inquiry, isAnswered };
    }

    const messages: agentMessages = {
      paraphrase: isQuestion ? "" : paraphrase,
      link: isQuestion ? "" : link,
      answer: isQuestion ? answer : "",
      question: MESSAGE.VTS_TWO_EN,
    };

    const { agent } = await combineAgentMessage({ messages, user, textContext });

    // update context
    context[context.length - 1].ai = agent;
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    return { agent, isAnswered };
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
    // Get context
    const { context, textContext, previousQuestion, reply } = await getContext({ sessionID, user });

    // LLM init
    const chain = await CustomChain.getDefaultChain();
    const { prompt: paraphrasePrompt } = getParaphrasePrompt({ user, previousQuestion });
    const { prompt: relatedQuestionPrompt } = getRelatedQuestionPrompt({ user, previousQuestion });
    const { prompt: answerWithVectorDBPrompt } = getAnswerWithVectorDBPrompt({
      user,
    });
    const { prompt: askAgainPrompt } = getAskAgainPrompt({ user, previousQuestion });

    const [questionResult, answerResult, { text: paraphrase }, { text: link }, { text: answer }, { text: inquiry }] =
      await Promise.all([
        getIsQuestion({ sentences: user }),
        getIsAnswer({ previousQuestion, reply }),
        chain.call({ query: JSON.stringify(paraphrasePrompt) }),
        chain.call({ query: JSON.stringify(relatedQuestionPrompt) }),
        chain.call({ query: JSON.stringify(answerWithVectorDBPrompt) }),
        chain.call({ query: JSON.stringify(askAgainPrompt) }),
      ]);

    const isQuestion = questionResult.isQuestion || false;
    const isAnswered = answerResult.isAnswer || true;

    if (isAnswered === false) {
      console.log(`
      ■■■■■■■■■[USER DID NOT ANSWER]■■■■■■■■■
      Decision Reason: ${answerResult.reason}
      ■■■■■■■■■[ASKING AGAIN]■■■■■■■■■■■■■■■■
      ${inquiry}
    `);
      context[context.length - 1].ai = inquiry;
      await redisClient.set(`context:${sessionID}`, JSON.stringify(context));
      return { agent: inquiry, isAnswered };
    }

    const messages: agentMessages = {
      paraphrase: isQuestion ? "" : paraphrase,
      link: isQuestion ? "" : link,
      answer: isQuestion ? answer : "",
      question: MESSAGE.VTS_THREE_EN,
    };

    const { agent } = await combineAgentMessage({ messages, user, textContext });

    context[context.length - 1].ai = agent;
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    return { agent, isAnswered };
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
    const { context, textContext, previousQuestion, reply } = await getContext({ sessionID, user });

    // LLM init
    const chain = await CustomChain.getDefaultChain();
    const { prompt: paraphrasePrompt } = getParaphrasePrompt({ user, previousQuestion });
    const { prompt: relatedQuestionPrompt } = getRelatedQuestionPrompt({ user, previousQuestion });
    const { prompt: answerWithVectorDBPrompt } = getAnswerWithVectorDBPrompt({
      user,
    });
    const { prompt: additionalQuestionPrompt } = getAdditionalQuestionPrompt({ user, previousQuestion });
    const { prompt: askAgainPrompt } = getAskAgainPrompt({ user, previousQuestion });

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
    //     sourceSentence = (await chain.call({ query: JSON.stringify(additionalQuestionPrompt) })).text;
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

    const [
      questionResult,
      answerResult,
      { text: paraphrase },
      { text: link },
      { text: answer },
      { text: question },
      { text: inquiry },
    ] = await Promise.all([
      getIsQuestion({ sentences: user }),
      getIsAnswer({ previousQuestion, reply }),
      chain.call({ query: JSON.stringify(paraphrasePrompt) }),
      chain.call({ query: JSON.stringify(relatedQuestionPrompt) }),
      chain.call({ query: JSON.stringify(answerWithVectorDBPrompt) }),
      chain.call({ query: JSON.stringify(additionalQuestionPrompt) }),
      chain.call({ query: JSON.stringify(askAgainPrompt) }),
    ]);

    const isQuestion = questionResult.isQuestion || false;
    const isAnswered = answerResult.isAnswer || true;

    if (isAnswered === false) {
      console.log(`
      ■■■■■■■■■[USER DID NOT ANSWER]■■■■■■■■■
      Decision Reason: ${answerResult.reason}
      ■■■■■■■■■[ASKING AGAIN]■■■■■■■■■■■■■■■■
      ${inquiry}
    `);
      context[context.length - 1].ai = inquiry;
      await redisClient.set(`context:${sessionID}`, JSON.stringify(context));
      return { agent: inquiry, isAnswered };
    }

    const messages: agentMessages = {
      paraphrase: isQuestion ? "" : paraphrase,
      link: isQuestion ? "" : link,
      answer: isQuestion ? answer : "",
      question,
    };

    const { agent } = await combineAgentMessage({ messages, user, textContext });

    context[context.length - 1].ai = agent;
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    return { agent, isAnswered };
  } catch (e) {
    console.error("🔥return additional question error🔥", e);
  }
};

// VTS_TWO_EN: `What else can you find in the painting?`,
// let additionalQuestion = "What else can you find in the painting?"; // similarity is 1.00
// let additionalQuestion = "What can you find in the paintings?"; // similarity is 0.88
// let additionalQuestion = "What can you find in the city?"; // similarity is 0.45
