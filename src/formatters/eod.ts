import { EodUpdateAnswers, CompletedTicket, TicketInfo } from '../types.js';

function formatTicketsWithAccomplishments(tickets: readonly TicketInfo[]): string {
  return tickets
    .map((ticket) => {
      const accomplishmentsList =
        ticket.accomplishments.length > 0
          ? '\n' + ticket.accomplishments.map((acc) => `  * ${acc}`).join('\n')
          : '';
      return `* [${ticket.key}](${ticket.url})${accomplishmentsList}`;
    })
    .join('\n');
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
  const ticketsFormatted = formatTicketsWithAccomplishments(answers.tickets);
  const completedFormatted = formatCompletedTickets(answers.completedTickets);
  const prLine = formatPullRequest(answers.pullRequest);

  return `*_End of Day Status_*
*Producer:* ${answers.producer}

*What tickets did you work on today?:*
${ticketsFormatted}

*Any tickets completed?:* ${completedFormatted}

*Current status/progress:* ${answers.status}

${prLine}

*Blockers or issues:* ${answers.blockers}

*Plan for tomorrow:* ${answers.tomorrow}`;
}
