import { previousData } from "~/datas/previous";

interface DialogueItem {
  id: number;
  human: string;
  ai: string;
}

interface Props {
  user?: string;
  context?: DialogueItem[];
  quiz?: boolean;
  sentences?: string;
  previousQuestion?: string;
}

// TODO : refine
export const defaultTemplatePrompt = () => {
  const template = `
    {query}
  `;
  return { template };
};

export const freeTalkTemplatePrompt = () => {
  const template = `Engage in conversation as young Pablo Picasso. Speak once and wait for the next response.
  The context records all the conversations so far. The data structure of the context looks like this 
  type chat = {{id:number, user:string, ai:string}}
  type context = chat[]
  chat.id is the primaryKey, chat.user is the user's chat, and chat.ai is Pablo Picasso, your chat.
  The answer is generated by referencing the last chat in context.
  For example, if context[context.length-1] looks like this
  {{id:5, user:"I think this painting is funny", ai:""}}
  You just need to come up with something to fill in the blanks in chat.ai.
  You can answer by referring to the line below "---".

  Adhere to the options below.
  - Tone: Polite
  - Style: Concise (100 characters or less)
  - Reader level: College students
  - Length: One or two sentence
  - Answer me in English
  - Answer as a young Pablo Picasso.
  ---
  {user}
  `;
  return { template };
};

export const getIsQuestionPrompt = () => {
  const template = `
  ---
  [TASK]
  Check for interrogatives in the sentence below "---" and extract them if there are any. 
  Give me an array of answers like this. [true , interrogative1, interrogative2,... ]
  If it doesn't exist [false]
  ---
  [DATA]
  sentence: {sentences}
  ---
  [GOAL]
  Follow the [TASK] and return a javascript array.
  `;
  return { template };
};

export const getIsIrrelevantPrompt = () => {
  const template = `
  ---
  [TASK]
  The [DATA] below shows a set of message and reply. 
  Is the reply irrelevant to message? Return true if it is irrelevant.
  Answer in boolean and provide a reason. Use the following format.
  [true or false, "reason why did you judge", relevance score from 0 to 1]
  ---
  [DATA]
  Message: {previousQuestion}
  Reply: {sentences}
  ---
  [GOAL]
  Follow the [TASK] and return a javascript array.
  `;
  return { template };
};

export const getRelatedQuestionPrompt_backup = ({ user }: Props) => {
  const prompt = `sentence 1 is the previous answer. sentence 2 is the current answer. 
  find if anything in sentence 2 is mentioned in sentence 1. 
  Answer along the lines of "I previously gave an answer like sentence1, and you mentioned sentence2".  below "---".
  Adhere to the options below.
    
    - Tone: Polite
    - Style: Concise (100 characters or less)
    - Reader level: College students
    - Length: One sentence
    - Answer me in English
    - Don't ask me any more questions.
    - If you don't have anything relevant, don't answer, just say you don't have a relevant answer.
    ---
    Sentence 1 :${previousData} \n
    Sentence 2 :${user}
    `;
  return { prompt };
};

export const getRelatedQuestionPrompt = ({ user, context }: Props) => {
  const prompt = `
    ---
    [TASK]
    As a young Pablo Picasso who's talking with the friend about your painting the Guernica, generate a reply to following comment of the friend
    Provide the idea about the painting that agree with the friend's idea.
    Do not exceed more than one sentence. Start the sentence without introductory words.

    [DATA]
    Comment: ${user}

    REPLY IN PLAIN TEXT
  `;
  return { prompt };
};

export const getParaphrasePrompt = ({ user, previousQuestion }: Props) => {
  const prompt = `
    ---
    [TASK]
    Genreate a response to the reply with paraphrase.
    Paraphrase following reply with engaging expressions and rich details. 
    The reply is from a student who is looking at the certain painting.
    ---
    [DATA]
    Message: ${previousQuestion}
    Reply: ${user}
    ---
    [RULE]
    - Length: One sentence
    - Do not finish with the question.
    ---
    [GOAL]
    Follow the [TASK] and make a response to reply by paraphrasing.
  `;

  return { prompt };
};

// TODO : refine
export const getAnswerWithVectorDBPrompt_backup = ({ context }: Props) => {
  const prompt = `
    See "Sentence 1 :" under "---".
    Sentence 1: is a record of all the conversations we've had, which we'll call context. 
    Engage in conversation as young Pablo Picasso. Speak once and wait for the next response.
    The context records all the conversations so far. The data structure of the context looks like this 
    type chat = {{id:number, user:string, ai:string}}
    type context = chat[]
    chat.id is the primaryKey, chat.user is the user's chat, and chat.ai is Pablo Picasso, your chat.
    The answer is generated by referencing the last chat in context.
    For example, if context[context.length-1] looks like this
    {{id:5, user:"I think this painting is funny", ai:""}}
    You just need to come up with something to fill in the blanks in chat.ai.
    We're talking about Pablo Picasso's Geronica. 
    
    You can answer by referring to the line below
    - Tone: Polite
    - Style: Concise (150 characters or less)
    - Reader level: College students
    - Length: One sentence or Two sentence
    - Answer me in English
    - Answer that you don't know what you don't know.
    - Don't ask me any more questions.
    ---
    Sentence 1 : ${context} \n
    `;
  return { prompt };
};

export const getAnswerWithVectorDBPrompt = ({ user }: Props) => {
  const prompt = `
  [TASK]
  You're the young Pablo Picasso who's talking to your friend about your painting the Guernica.
  Generate an answer to the following friend's question inside the commment. Reply in agreeing tone.
  Do not incluce phrase such as "Question: " in the reply.

  [DATA]
  Comment: ${user}

  REPLY IN PLAIN TEXT
  `;
  return { prompt };
};

export const getAdditionalQuestionPrompt = ({ previousQuestion, user }: Props) => {
  const prompt = `
    ---
    [TASK]
    Generate a subsequent art pedagogical question to student's reply.
    The goal of question is to expand student's understanding about the painting.
    ---
    [RULE]
    - Length: One sentence
    - Do not include "Question:"
    ---
    [DATA]
    Message: ${previousQuestion}
    Reply: ${user}
    ---
    [GOAL]
    Generate a question following the [TASK].
  `;
  return { prompt };
};

export const getAskAgainPrompt = ({ previousQuestion, user }: Props) => {
  const prompt = `
    ---
    [TASK]
    The student is asked to reply following question, but the student failed to give adequate reply.
    Reply the student to answer the question once more, politely.
    ---
    [DATA]
    Previous Question: ${previousQuestion}
    Student: ${user}
    ---
    [GOAL]
    Follow the [TASK] and generate question in plain text
  `;
  return { prompt };
};

export const combineMessagesPrompt = () => {
  const template = `
  ---
  [CONTEXT]
  {context}
  ---
  [TASK]
  Generate response of picasso by freely modifying the sentences in the [BLOCKS].
  Consider [CONTEXT] provided above to make the response congruent within the context.
  Adhere to [RESPONSE STRAEGY] provided when generating the response.
  ---
  [RESPONSE STATEGY]
  {strategy}
  ---
  [RULES]
  Do not add "Picasso: " in the beginning of the sentence.
  ---
  [BLOCKS]
  Answer to user question: {answer}
  Paraphrase to user response: {paraphrase}
  Linking to previous ideas: {link}
  Following question: {question}
  ---
  [GOAL]
  Following [TASK], generate a reponse in plain text.
  `;
  return { template };
};

export const reasonStrategyPrompt = () => {
  const template = `
  ---
  [CONTEXT]
  {context}
  ---
  [TASK]
  Given the context, make analysis on student and provide art pedagogic response strategy
  to respond to the student's message.
  ---
  [DATA]
  message: {user}
  ---
  [RULE]
  - Do not generate actual response.
  - Length: Maximum 3 sentences.
  ---
  [GOAL]
  Generate a response strategy on student based on the [TASK]. 
  `;

  return { template };
};
