export interface TicketInfo {
  readonly key: string;
  readonly url: string;
}

export interface DailyStandupAnswers {
  readonly producer: string;
  readonly company: string;
  readonly tickets: readonly TicketInfo[];
  readonly estimateExceeded: string;
  readonly workRemaining: string;
  readonly timeRemaining: string;
  readonly completionDate: string;
  readonly blockers: string;
}

export interface Accomplishment {
  readonly text: string;
}

export interface CompletedTicket {
  readonly key: string;
  readonly url: string;
  readonly pullRequests: {
    branchName: string;
    title: string;
    prLink: string;
  }[];
}

export interface PullRequest {
  readonly label: string;
  readonly url: string;
}

export interface EodUpdateAnswers {
  readonly producer: string;
  readonly company: string;
  readonly tickets: readonly TicketInfo[];
  readonly accomplishments: readonly Accomplishment[];
  readonly completedTickets: readonly CompletedTicket[];
  readonly status: string;
  readonly pullRequest: PullRequest | null;
  readonly blockers: string;
  readonly tomorrow: string;
}

export interface PromptOptions {
  readonly prompt: string;
  readonly defaultValue?: string;
}

export interface ConfirmOptions {
  readonly prompt: string;
  readonly defaultValue?: boolean;
}
