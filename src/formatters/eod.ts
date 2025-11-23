import { EodUpdateAnswers, Accomplishment, CompletedTicket } from '../types.js';
import { formatTicketsAsBulletList } from '../utils/jira.js';

function formatAccomplishments(accomplishments: readonly Accomplishment[]): string {
  return accomplishments.map((acc) => `* ${acc.text}`).join('\n');
}

function formatCompletedTickets(tickets: readonly CompletedTicket[]): string {
  if (tickets.length === 0) {
    return 'None.';
  }
  return tickets.map((ticket) => `[${ticket.key}](${ticket.url})`).join(', ');
}

function formatPullRequest(pr: EodUpdateAnswers['pullRequest']): string {
  if (!pr) {
    return '*Pull Request for review:* None.';
  }
  return `*Pull Request for review:* [${pr.label}](${pr.url})`;
}

export function formatEodMessage(answers: EodUpdateAnswers): string {
  const ticketsFormatted = formatTicketsAsBulletList(answers.tickets);
  const accomplishmentsFormatted = formatAccomplishments(answers.accomplishments);
  const completedFormatted = formatCompletedTickets(answers.completedTickets);
  const prLine = formatPullRequest(answers.pullRequest);

  return `*_End of Day Status_*
*Producer:* ${answers.producer}

*What tickets did you work on today?:*
${ticketsFormatted}

*What did you accomplish today?:*
${accomplishmentsFormatted}

*Any tickets completed?:* ${completedFormatted}

*Current status/progress:* ${answers.status}

${prLine}

*Blockers or issues:* ${answers.blockers}

*Plan for tomorrow:* ${answers.tomorrow}`;
}
