import axios from "axios";

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
