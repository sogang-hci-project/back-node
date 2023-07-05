import { getAnswerWithVectorDBPrompt, getParaphrasePrompt, getRelatedQuestionPrompt } from "~/prompts";
import { CHAIN_INIT_TYPE } from "../../types/type";
import { chainInitializer } from "./langchain";

/**
 * test for paraphrase prompt
 * if input is correct, ai @return nice answer in string type
 * else ai @return "I didn't quite understand." in string type
 */
// (async function main() {
//   const chain = await chainInitializer({ type: CHAIN_INIT_TYPE.VECTOR });
//   const good_input = `I'm back from work today and continue my side project to write my thesis. There are five people on my thesis team and they are all awesome.`;
//   const bad_input = `.`;
//   const { prompt: paraphrasePrompt_good } = getParaphrasePrompt({ user: good_input });
//   const { prompt: paraphrasePrompt_bad } = getParaphrasePrompt({ user: bad_input });

//   const result_good = (await chain.call({ query: JSON.stringify(paraphrasePrompt_good) }))?.text;
//   const result_bad = (await chain.call({ query: JSON.stringify(paraphrasePrompt_bad) }))?.text;
//   console.log("good 🎉", result_good);
//   console.log("error 🔥", result_bad);
// })();

/**
 * test for finding related answer prompt
 *
 */
// (async function main() {
//   const chain = await chainInitializer({ type: CHAIN_INIT_TYPE.VECTOR });
//   const user = `I see`;
//   const { prompt: RelatedQuestionPrompt } = getRelatedQuestionPrompt({ user });

//   const [isRelated, comment] = JSON.parse((await chain.call({ query: JSON.stringify(RelatedQuestionPrompt) })).text);
//   return { isRelated, comment };
// })();

/**
 * test for actual answer with Vector DB
 * @return
 */
// (async function main() {
//   const chain = await chainInitializer({ type: CHAIN_INIT_TYPE.VECTOR });
//   const user = `In Picasso's Guernica, we see a woman crying.`;
//   const context = JSON.stringify([{ id: "1", ai: "What do you see in the picture?", user: "" }]);
//   const { prompt: answerWithVectorDB } = getAnswerWithVectorDBPrompt({ user, context });
//   const result = (await chain.call({ query: JSON.stringify(answerWithVectorDB) })).text;
//   console.log(result);
// })();

// (async function main() {
//   const chain = await chainInitializer({ type: CHAIN_INIT_TYPE.VECTOR });
//   const user = `we see a woman crying.`;
//   const { prompt: answerWithVectorDB } = getAnswerWithVectorDBPrompt({ user });

//   const result = (await chain.call({ query: JSON.stringify(answerWithVectorDB) }))?.text;
//   const regex = /Picasso:\s(.+)/;
//   const match = result.match(regex)?.[1];

//   console.log(result);
//   console.log(match);
//   //---\nPicasso: Yes, you see a woman crying in the painting. That is one of the many powerful and emotional elements depicted in Guernica.
//   //Yes, you see a woman crying in the painting. That is one of the many powerful and emotional elements depicted in Guernica.
// })();

(async function main() {
  const chain = await chainInitializer({ type: CHAIN_INIT_TYPE.VECTOR });
  const user = `we see a woman crying.`;
  const { prompt: answerWithVectorDB } = getAnswerWithVectorDBPrompt({ user });
});
