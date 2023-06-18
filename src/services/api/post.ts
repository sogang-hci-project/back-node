import { UserSession } from "~/controllers";
import { deeplTranslate, requestFreeLLMApi, updateSessionData } from "~/lib";

interface IData {
  user: string;
  sessionID?: string;
  additional?: boolean;
  done?: boolean;
}

interface sessionGreetingProps extends IData {
  lang: any;
  translatedText: string;
  original: string;
  session: UserSession;
}

export const sessionGreeting = async ({
  user,
  sessionID,
  original,
  translatedText,
  lang,
  session,
}: sessionGreetingProps) => {
  const currentStage = "/session/greeting";
  const nextStage = `/vts/init?additional=true`;

  const data: IData = { user, sessionID };
  const result = await requestFreeLLMApi(data);
  const agent = result.text;
  const contents = { agent };

  session.user.currentStage = currentStage;
  session.user.nextStage = nextStage;
  updateSessionData(session, sessionID);

  if (lang === "ko" && translatedText) {
    user = original;
    contents.agent = await deeplTranslate(agent, "en");
    console.log("응답 보내기 전 : 한글 -> 영어");
  }
  return { contents, currentStage, nextStage };
};
