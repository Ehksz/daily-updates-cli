import { DailyStandupAnswers } from '../types.js';
import { formatTicketsAsMarkdown } from '../utils/jira.js';

export function formatStandupMessage(answers: DailyStandupAnswers): string {
  const ticketsFormatted = formatTicketsAsMarkdown(answers.tickets);

  return `*Producer:* ${answers.producer}

*What tickets are you working on?:*
${ticketsFormatted}

*Will any of these tickets exceed the original estimate? If so, what should the estimates be changed to? (notify the producer, but don't change the estimate yourself):* ${answers.estimateExceeded}

*Work remaining:* ${answers.workRemaining}

*Time remaining:* ${answers.timeRemaining}

*Completion date:* ${answers.completionDate}

*Blockers or dependencies:* ${answers.blockers}`;
}
