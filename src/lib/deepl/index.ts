import axios from "axios";

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
