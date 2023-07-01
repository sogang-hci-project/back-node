import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

import { OPENAI_API_KEY as openAIApiKey, freeTalkTemplate } from "~/constants";
import loadVectorStore from "~/lib/langchain/load-local-db";

export const model = new ChatOpenAI({
  temperature: 0, // 0 is best for chat bot
  openAIApiKey,
  verbose: true,
  streaming: false,
  callbacks: [
    {
      handleLLMNewToken(token: string) {
        process.stdout.write(token);
      },
    },
  ],
});

export async function chainInitializer({ free }: { free: boolean }) {
  const vectorStore = await loadVectorStore();
  let chain;
  const { prompt: template } = freeTalkTemplate();

  if (free) {
    const prompt = new PromptTemplate({
      template: template,
      inputVariables: ["context"],
    });
    chain = new LLMChain({ llm: model, prompt: prompt });
  } else {
    chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
  }
  return chain;
}

//template:"separate below sentence. this made me feel a bit overwhelmed because there's lots of elements going on so it was kind of hard to catch it like catch the meanings behind it at first look but the more I look into it, it's getting there I can see people dead, I mean not dead but like lie on the floor and someone trying to eat the ball I think and the light bulb kind of represents the sun or the eye. Yeah I think that's it.",
export async function separateSentence() {
  const vectorStore = await loadVectorStore();
  let chain;
  // TODO : separate template
  const { prompt: template } = freeTalkTemplate();

  const prompt = new PromptTemplate({
    template: template,
    inputVariables: ["context"],
  });
  chain = new LLMChain({ llm: model, prompt: prompt });

  return chain;
}
