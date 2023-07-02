import fetch from "node-fetch";
import { MESSAGE } from "~/datas";
import { HUGGINGPACE_API_TOKEN } from "~/constants";
import { SIMILARITY_TYPE } from "~/types";

const API_TOKEN = HUGGINGPACE_API_TOKEN;

interface Props {
  type: SIMILARITY_TYPE;
  sourceSentence: string;
}

export async function getSimilarityWithVTS({ type, sourceSentence }: Props) {
  const data = {
    inputs: {
      source_sentence: sourceSentence,
      sentences: type === SIMILARITY_TYPE.WITH_VTS_THREE ? [MESSAGE.VTS_THREE_EN] : [MESSAGE.VTS_TWO_EN],
    },
  };
  const response = await fetch("https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2", {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    method: "POST",
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
}
