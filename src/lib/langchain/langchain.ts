import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

import { OPENAI_API_KEY as openAIApiKey } from "~/constants";
import loadVectorStore from "~/lib/langchain/load-local-db";
import { SeperateSentenceTemplate, freeTalkTemplate } from "~/prompts";

export const llm = new ChatOpenAI({
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

interface Props {
  type?: string;
  sentences?: string;
}

export async function chainInitializer({ type, sentences }: Props) {
  const vectorStore = await loadVectorStore();
  let chain;

  if (type === "free") {
    const { template } = freeTalkTemplate();
    const prompt = new PromptTemplate({
      template,
      inputVariables: ["user"],
    });
    chain = new LLMChain({ llm, prompt });
  } else if (type === "seperate") {
    const { template } = SeperateSentenceTemplate({ sentences });
    const prompt = new PromptTemplate({
      template,
      inputVariables: ["sentences"],
    });
    chain = new LLMChain({ llm, prompt: prompt });
  } else {
    // using Vector Store
    chain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever());
  }
  return chain;
}
