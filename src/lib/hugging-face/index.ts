import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const API_TOKEN = process.env.HUGGINGPACE_API_TOKEN;

const example = {
  inputs: {
    source_sentence: "That is a happy person",
    sentences: ["That is a happy dog", "That is a very happy person", "Today is a sunny day"],
  },
};

type data = typeof example;

export async function getSimilarity(data: data) {
  const response = await fetch("https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2", {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    method: "POST",
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
}
