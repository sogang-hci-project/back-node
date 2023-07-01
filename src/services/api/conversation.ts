import { VTS, getAnswerWithVectorDBPrompt, getParaphrasePrompt, getRelatedQuestionPrompt } from "~/constants";
import { chainInitializer, redisClient, updateSessionData } from "~/lib";
import { UserSession } from "~/types";

interface InputProps {
  sessionID: string;
  session: UserSession;
  lang: string;
  user: string;
}

export const conversation_zero = async ({ sessionID, session, lang, user }: InputProps) => {
  try {
    // 동의해주셔서 감사합니다. 첫번째 그림에서 무엇이 보이시나요?

    const currentStage = "/conversation/0";
    const nextStage = "/conversation/1";

    // init context
    let context = JSON.parse(await redisClient.get(`context:${sessionID}`));
    if (!context) context = [];
    const chat = { id: context.length + 1, human: user, ai: `Thank you for agreeing. ${VTS.VTS_ONE_EN}` };
    context.push(chat);
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    // update user session data
    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);
    const contents = { agent: lang === "ko" ? VTS.VTS_ONE_KO : VTS.VTS_ONE_EN };

    return { contents, currentStage, nextStage };
  } catch (e) {
    console.error("", e);
  }
};

export const conversation_one = async ({ sessionID, session, lang, user }: InputProps) => {
  try {
    const currentStage = "/conversation/1";
    const nextStage = "/conversation/2";

    let context = JSON.parse(await redisClient.get(`context:${sessionID}`));
    if (!context) context = [];
    const chat = { id: context.length + 1, human: user, ai: `` };
    context.push(chat);
    await redisClient.set(`context:${sessionID}`, JSON.stringify(context));

    // DL

    // LLM
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

    const agent = `${result[0].text}${result[1].text}${result[2].text}`;

    session.user.currentStage = currentStage;
    session.user.nextStage = nextStage;
    updateSessionData(session, sessionID);

    const contents = { agent };

    return { contents, currentStage, nextStage };
  } catch (e) {
    console.error("🔥 conversation_one service error 🔥", e);
  }
};
