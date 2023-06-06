import axios from "axios";
import { UserSession } from "~/controllers";
import { redisClient } from "~/lib/redis";

export async function updateSessionData(session: UserSession, sessionID: string) {
  await redisClient.set(`sess:${sessionID}`, JSON.stringify(session));
}

export async function deeplTranslate(text: string, sourceLang: string) {
  const target_lang = sourceLang === "en" ? "KO" : "EN";
  const data = new URLSearchParams();
  data.append("text", text);
  data.append("target_lang", target_lang);

  const headers = {
    Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
    ContentType: "application/x-www-form-urlencoded",
  };
  const result = await axios.post(process.env.DEEPL_REQUEST_URI, data, { headers });
  const translatedText = result.data?.translations[0]?.text;

  return translatedText;
}

export async function papagoTranslate(text: string, sourceLang: string) {
  const targetLang = sourceLang === "en" ? "ko" : "en";
  const options = {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": process.env.NAVER_CLOUD_PAPAGO_ID_KEY,
      "X-NCP-APIGW-API-KEY": process.env.NAVER_CLOUD_PAPAGO_SECRET_KEY,
    },
  };

  const res = await axios.post(
    `https://naveropenapi.apigw.ntruss.com/nmt/v1/translation`,
    {
      source: sourceLang,
      target: targetLang,
      text,
    },
    options
  );

  const translatedText = res.data.message.result.translatedText;

  return translatedText;
}
