import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { DATA_STORE_PATH, OPENAI_API_KEY as openAIApiKey } from "~/constants/";

/**
 * Load the vector store from the DATA_STORE_PATH
 * @returns vector db
 */
async function loadVectorStore() {
  const loadedVectorStore = await HNSWLib.load(DATA_STORE_PATH, new OpenAIEmbeddings({ openAIApiKey }));
  return loadedVectorStore;
}

export default loadVectorStore;
