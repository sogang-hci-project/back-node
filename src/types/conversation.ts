interface Stage {
  currentStage: string;
  nextStage: string;
}

export interface ConversationResponseOne extends Stage {
  sessionID: string;
}

export interface ConversationResponseTwo extends Stage {
  contents: {
    agent: string;
  };
}

export type ConversationResponse = Partial<ConversationResponseOne> | Partial<ConversationResponseTwo>;
