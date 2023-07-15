import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

import { OPENAI_API_KEY as openAIApiKey } from "~/constants";
import loadVectorStore from "~/lib/langchain/load-local-db";
import {
  getIsQuestionPrompt,
  getIsAnsweredPrompt,
  freeTalkTemplatePrompt,
  defaultTemplatePrompt,
  combineMessagesPrompt,
} from "~/prompts";

/////////////////////////
/// MODEL DECLARATION ///
/////////////////////////

export const chatGPT = new ChatOpenAI({
  temperature: 0, // 0 is best for chat bot
  openAIApiKey,
  verbose: false,
  streaming: false,
  callbacks: [
    {
      handleLLMNewToken(token: string) {
        process.stdout.write(token);
      },
    },
  ],
});

/////////////////////////////
/// GET CHAIN DECLARATION ///
/////////////////////////////

interface defaultChainInput {
  query: string;
}

export async function getDefaultChain() {
  const { template } = defaultTemplatePrompt();
  const prompt = new PromptTemplate({
    template,
    inputVariables: ["query"],
  });
  return new LLMChain<defaultChainInput>({ llm: chatGPT, prompt });
}

export async function getCombineMessageChain() {
  const { template } = combineMessagesPrompt();
  const prompt = new PromptTemplate({
    template,
    inputVariables: ["answer", "paraphrase", "link", "question", "context"],
  });
  return new LLMChain<defaultChainInput>({ llm: chatGPT, prompt });
}

export async function getFreeChain() {
  const { template } = freeTalkTemplatePrompt();
  const prompt = new PromptTemplate({
    template,
    inputVariables: ["user"],
  });
  return new LLMChain({ llm: chatGPT, prompt });
}

export async function getQuestionDiscriminatorChain() {
  const { template } = getIsQuestionPrompt();
  const prompt = new PromptTemplate({
    template,
    inputVariables: ["sentences"],
  });
  return new LLMChain({ llm: chatGPT, prompt });
}

export async function getResponseDiscriminatorChain() {
  const { template } = getIsAnsweredPrompt();
  const prompt = new PromptTemplate({
    template,
    inputVariables: ["sentences", "previousQuestion"],
  });
  return new LLMChain({ llm: chatGPT, prompt });
}

export async function getVectorStoreAnswerChain() {
  const vectorStore = await loadVectorStore();
  return RetrievalQAChain.fromLLM(chatGPT, vectorStore.asRetriever());
}
