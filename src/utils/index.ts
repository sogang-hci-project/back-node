import axios from "axios";
import { UserSession } from "~/controllers";
import { redisClient } from "~/lib/redis";

export async function updateSessionData(session: UserSession, sessionID: string) {
  await redisClient.set(`sess:${sessionID}`, JSON.stringify(session));
}

export async function languageToggler(text: string, currentLang: string) {
  const target_lang = currentLang === "en" ? "KO" : "EN";
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
