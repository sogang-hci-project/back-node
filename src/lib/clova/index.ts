import axios, { type ResponseType } from "axios";

export async function clovaTextToSpeech(text: string, voice: string) {
  try {
    const options = {
      responseType: "arraybuffer" as ResponseType,
      headers: {
        "X-NCP-APIGW-API-KEY-ID": process.env.NAVER_CLOUD_CLOVA_ID_KEY,
        "X-NCP-APIGW-API-KEY": process.env.NAVER_CLOUD_CLOVA_SECERT_KEY,
      },
    };

    const requestParam = new URLSearchParams();
    requestParam.append("volume", "0");
    requestParam.append("speed", "-1");
    requestParam.append("pitch", "0");
    requestParam.append("end-pitch", "-2");
    requestParam.append("speaker", voice);
    requestParam.append("text", text);

    const res = await axios.post(
      `https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts`,
      requestParam.toString(),
      options
    );
    return res.data;
  } catch (e) {
    console.log(e.message);
  }
}
