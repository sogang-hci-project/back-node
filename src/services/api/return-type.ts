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

interface isIrrelevantProps {
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
  strategy: string;
  textContext: string;
  messages: agentMessages;
  secondVTS?: boolean;
  thirdVTS?: boolean;
}

export const combineAgentMessage = async ({ messages, strategy, user, textContext }: combineAgentMessageProps) => {
  const answer = messages.answer || "";
  const paraphrase = messages.paraphrase || "";
  const link = messages.link || "";
  const question = messages.question;
  const combineChain = await CustomChain.getCombineMessageChain();

  console.log(`
  ■■■■■■■■■[GENERATION RESULT]■■■■■■■■■
  ■■■■■■■■■[STRATEGY]■■■■■■■■■■■■■■■■
  ${strategy}
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

  const agent = (
    await combineChain.call({
      strategy,
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

export async function getIsIrrelevant({ previousQuestion, reply }: isIrrelevantProps) {
  try {
    const chain = await CustomChain.getResponseDiscriminatorChain();
    const [isIrrelevant, reason] = JSON.parse((await chain.call({ sentences: reply, previousQuestion }))?.text);

    return { isIrrelevant, reason };
  } catch (e) {
    console.error("🔥 isIrrelevant function error 🔥", e);
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
    const QAchain = await CustomChain.getVectorStoreAnswerChain();
    const reasoningChain = await CustomChain.getStrategyReasoningChain();

    const { prompt: paraphrasePrompt } = getParaphrasePrompt({ user, previousQuestion });
    const { prompt: relatedQuestionPrompt } = getRelatedQuestionPrompt({ user, previousQuestion });
    const { prompt: answerWithVectorDBPrompt } = getAnswerWithVectorDBPrompt({
      user,
    });
    const { prompt: askAgainPrompt } = getAskAgainPrompt({ user, previousQuestion });

    const [
      questionResult,
      answerResult,
      { text: paraphrase },
      { text: link },
      { text: answer },
      { text: inquiry },
      { text: strategy },
    ] = await Promise.all([
      getIsQuestion({ sentences: user }),
      getIsIrrelevant({ previousQuestion, reply }),
      chain.call({ query: JSON.stringify(paraphrasePrompt) }),
      chain.call({ query: JSON.stringify(relatedQuestionPrompt) }),
      QAchain.call({ query: JSON.stringify(answerWithVectorDBPrompt) }),
      chain.call({ query: JSON.stringify(askAgainPrompt) }),
      reasoningChain.call({ context: textContext, user }),
    ]);

    const isQuestion = questionResult.isQuestion === undefined ? false : questionResult.isQuestion;
    const isIrrelevant = answerResult.isIrrelevant === undefined ? false : answerResult.isIrrelevant;
    console.log(answerResult);

    if (isIrrelevant === true) {
      console.log(`
        ■■■■■■■■■[USER DID NOT ANSWER]■■■■■■■■■
        Decision Reason: ${answerResult.reason}
        ■■■■■■■■■[ASKING AGAIN]■■■■■■■■■■■■■■■■
        ${inquiry}
      `);
      context[context.length - 1].ai = inquiry;
      await redisClient.set(`context:${sessionID}`, JSON.stringify(context));
      return { agent: inquiry, isIrrelevant };
    }

    const messages: agentMessages = {
      paraphrase: isQuestion ? "" : paraphrase,
      link: isQuestion ? "" : link,
      answer: isQuestion ? answer : "",
      question: MESSAGE.VTS_TWO_EN,
    };

    const { agent } = await combineAgentMessage({ messages, strategy, user, textContext });

    // update context
    context[context.length - 1].ai = agent;
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    return { agent, isIrrelevant };
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
    const reasoningChain = await CustomChain.getStrategyReasoningChain();
    const QAchain = await CustomChain.getVectorStoreAnswerChain();
    const { prompt: paraphrasePrompt } = getParaphrasePrompt({ user, previousQuestion });
    const { prompt: relatedQuestionPrompt } = getRelatedQuestionPrompt({ user, previousQuestion });
    const { prompt: answerWithVectorDBPrompt } = getAnswerWithVectorDBPrompt({
      user,
    });
    const { prompt: askAgainPrompt } = getAskAgainPrompt({ user, previousQuestion });

    const [
      questionResult,
      answerResult,
      { text: paraphrase },
      { text: link },
      { text: answer },
      { text: inquiry },
      { text: strategy },
    ] = await Promise.all([
      getIsQuestion({ sentences: user }),
      getIsIrrelevant({ previousQuestion, reply }),
      chain.call({ query: JSON.stringify(paraphrasePrompt) }),
      chain.call({ query: JSON.stringify(relatedQuestionPrompt) }),
      QAchain.call({ query: JSON.stringify(answerWithVectorDBPrompt) }),
      chain.call({ query: JSON.stringify(askAgainPrompt) }),
      reasoningChain.call({ context: textContext, user }),
    ]);

    const isQuestion = questionResult.isQuestion === undefined ? false : questionResult.isQuestion;
    const isIrrelevant = answerResult.isIrrelevant === undefined ? false : answerResult.isIrrelevant;

    if (isIrrelevant === true) {
      console.log(`
      ■■■■■■■■■[USER DID NOT ANSWER]■■■■■■■■■
      Decision Reason: ${answerResult.reason}
      ■■■■■■■■■[ASKING AGAIN]■■■■■■■■■■■■■■■■
      ${inquiry}
    `);
      context[context.length - 1].ai = inquiry;
      await redisClient.set(`context:${sessionID}`, JSON.stringify(context));
      return { agent: inquiry, isIrrelevant };
    }

    const messages: agentMessages = {
      paraphrase: isQuestion ? "" : paraphrase,
      link: isQuestion ? "" : link,
      answer: isQuestion ? answer : "",
      question: MESSAGE.VTS_THREE_EN,
    };

    const { agent } = await combineAgentMessage({ messages, strategy, user, textContext });

    context[context.length - 1].ai = agent;
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    return { agent, isIrrelevant };
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
    const reasoningChain = await CustomChain.getStrategyReasoningChain();
    const QAchain = await CustomChain.getVectorStoreAnswerChain();

    const { prompt: paraphrasePrompt } = getParaphrasePrompt({ user, previousQuestion });
    const { prompt: relatedQuestionPrompt } = getRelatedQuestionPrompt({ user, previousQuestion });
    const { prompt: answerWithVectorDBPrompt } = getAnswerWithVectorDBPrompt({
      user,
    });
    const { prompt: additionalQuestionPrompt } = getAdditionalQuestionPrompt({ user, previousQuestion });
    const { prompt: askAgainPrompt } = getAskAgainPrompt({ user, previousQuestion });

    const [
      questionResult,
      answerResult,
      { text: paraphrase },
      { text: link },
      { text: answer },
      { text: question },
      { text: inquiry },
      { text: strategy },
    ] = await Promise.all([
      getIsQuestion({ sentences: user }),
      getIsIrrelevant({ previousQuestion, reply }),
      chain.call({ query: JSON.stringify(paraphrasePrompt) }),
      chain.call({ query: JSON.stringify(relatedQuestionPrompt) }),
      QAchain.call({ query: JSON.stringify(answerWithVectorDBPrompt) }),
      chain.call({ query: JSON.stringify(additionalQuestionPrompt) }),
      chain.call({ query: JSON.stringify(askAgainPrompt) }),
      reasoningChain.call({ context: textContext, user }),
    ]);

    const isQuestion = questionResult.isQuestion === undefined ? false : questionResult.isQuestion;
    const isIrrelevant = answerResult.isIrrelevant === undefined ? false : answerResult.isIrrelevant;

    if (isIrrelevant === true) {
      console.log(`
      ■■■■■■■■■[USER DID NOT ANSWER]■■■■■■■■■
      Decision Reason: ${answerResult.reason}
      ■■■■■■■■■[ASKING AGAIN]■■■■■■■■■■■■■■■■
      ${inquiry}
    `);
      context[context.length - 1].ai = inquiry;
      await redisClient.set(`context:${sessionID}`, JSON.stringify(context));
      return { agent: inquiry, isIrrelevant };
    }

    const messages: agentMessages = {
      paraphrase: isQuestion ? "" : paraphrase,
      link: isQuestion ? "" : link,
      answer: isQuestion ? answer : "",
      question,
    };

    const { agent } = await combineAgentMessage({ messages, strategy, user, textContext });

    context[context.length - 1].ai = agent;
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    return { agent, isIrrelevant };
  } catch (e) {
    console.error("🔥return additional question error🔥", e);
  }
};
