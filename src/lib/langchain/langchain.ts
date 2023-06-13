import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

import { OPENAI_API_KEY as openAIApiKey, template } from "~/constants";
import loadVectorStore from "~/lib/langchain/load-local-db";

export const model = new ChatOpenAI({
  temperature: 0.7,
  openAIApiKey,
  verbose: true,
  streaming: true,
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
  if (free) {
    const prompt = new PromptTemplate({
      template: template,
      inputVariables: ["user"],
    });
    chain = new LLMChain({ llm: model, prompt: prompt });
  } else {
    chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
  }
  return chain;
}