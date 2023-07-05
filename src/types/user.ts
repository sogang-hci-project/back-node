import session from "express-session";

export interface UserSession extends session.Session {
  user: {
    currentStage: string;
    nextStage: string;
    next?: boolean;
    sessionGreeting?: boolean;
    initAdditional?: boolean;
    initDone?: boolean;
    firstAdditional?: boolean;
    firstDone?: boolean;
    secondAdditional?: boolean;
    secondDone?: boolean;
    thirdAdditional?: boolean;
    thirdDone?: boolean;
  };
  translatedText?: string;
}
