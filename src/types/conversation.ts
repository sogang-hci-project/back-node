export interface BaseConversationResponse {
  currentStage: string;
  nextStage: string;
  contents?: {
    agent?: string;
  };
}
