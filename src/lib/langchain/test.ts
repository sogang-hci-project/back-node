import { getParaphrasePrompt } from "~/prompts";
import { CHAIN_INIT_TYPE } from "./../../types/type";
import { chainInitializer } from "./langchain";

(async function main() {
  const chain = await chainInitializer({ type: CHAIN_INIT_TYPE.VECTOR });
  const user = `I'm back from work today and continue my side project to write my thesis. There are five people on my thesis team and they are all awesome.`;
  const { prompt: paraphrasePrompt } = getParaphrasePrompt({ user });

  const result = await chain.call({ query: JSON.stringify(paraphrasePrompt) });
  console.log("결과 확인", result);
})();
