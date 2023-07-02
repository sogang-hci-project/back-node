export enum SIMILARITY_TYPE {
  WITH_VTS_TWO = "WITH_VTS_TWO",
  WITH_VTS_THREE = "WITH_VTS_THREE",
}

export enum CHAIN_INIT_TYPE {
  FREE = "FREE",
  QUESTION = "QUESTION", // find question
  ANSWER = "ANSWER", // check a user answers about ai's previous question
  VECTOR = "VECTOR",
}
