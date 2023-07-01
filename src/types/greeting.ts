interface Stage {
  currentStage: string;
  nextStage: string;
}

export interface GreetingResponseOne extends Stage {
  sessionID: string;
}

export interface GreetingResponseTwo extends Stage {
  contents: {
    agent: string;
  };
}

export type GreetingResponse = Partial<GreetingResponseOne> | Partial<GreetingResponseTwo>;
