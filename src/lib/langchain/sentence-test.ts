import { chainInitializer } from "./langchain";
import { CHAIN_INIT_TYPE } from "~/types";

interface IsAnsweredProps {
  previousQuestion: string;
  answer: string;
}

interface IsQuestionProps {
  sentences: string;
}

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
 * @returns isAnswer:boolean, reason:string
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
