interface Stage {
  currentStage: string;
  nextStage: string;
}

export interface BaseConversationResponse extends Stage {
  contents?: {
    agent?: string;
  };
}

// for extension divide all stages
export interface ConversationResponseZero extends BaseConversationResponse {}
export interface ConversationResponseOne extends BaseConversationResponse {}

export type ConversationResponse = Partial<ConversationResponseZero> | Partial<ConversationResponseOne>;
