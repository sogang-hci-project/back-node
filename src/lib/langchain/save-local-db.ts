import fs from "fs";
import path from "path";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

import { DATA_STORE_PATH, OPENAI_API_KEY as openAIApiKey } from "~/constants";

export const folderPath = `${__dirname}/../../datas/markdown`;

export function getAllMarkDownFiles(folderPath: string) {
  let filePaths: any = [];

  function traverseFolder(currentPath: string) {
    const files = fs.readdirSync(currentPath);

    files.forEach((file) => {
      const filePath = path.join(currentPath, file);
      const fileStat = fs.statSync(filePath);

      if (fileStat.isDirectory()) {
        traverseFolder(filePath); // 재귀적으로 하위 폴더 탐색
      } else if (path.extname(file) === ".md") {
        filePaths.push(filePath); // .md 파일인 경우 경로 추가
      }
    });
  }

  traverseFolder(folderPath); // 최상위 폴더부터 시작하여 모든 하위 폴더 탐색
  return filePaths;
}

const filePaths = getAllMarkDownFiles(folderPath);

/**
 * const filePaths ['path1','path2',...]
 * only directly call this file,
 * main function execute
 * Save vector db in DATA_STORE path for reusing vector db with static markdown files
 */

async function main() {
  const documents: any = [];
  await Promise.all(
    filePaths.map(async (file: string) => {
      const text = fs.readFileSync(file, "utf-8");
      const regex = /\/hci-node(.*)/;
      const relativePath = file.match(regex)[1];
      documents.push(new Document({ pageContent: text, metadata: { source: relativePath } }));
    })
  );
  const textSplitter = new CharacterTextSplitter({
    separator: "##",
    chunkSize: 212,
    chunkOverlap: 2,
  });
  const splitedText = await textSplitter.splitDocuments(documents);
  //create vector database using documents and save to DATA_STORE_PATH
  const vectorStore = await HNSWLib.fromDocuments(splitedText, new OpenAIEmbeddings({ openAIApiKey }));
  await vectorStore.save(DATA_STORE_PATH);
}
if (require.main === module) {
  main();
}
