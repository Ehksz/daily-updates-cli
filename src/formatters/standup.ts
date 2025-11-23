import { DailyStandupAnswers, TicketInfo } from '../types.js';

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

export function formatStandupMessage(answers: DailyStandupAnswers): string {
  const ticketsFormatted = formatTicketsWithAccomplishments(answers.tickets);

  return `*Producer:* ${answers.producer}

*What tickets are you working on?:*
${ticketsFormatted}

*Will any of these tickets exceed the original estimate? If so, what should the estimates be changed to? (notify the producer, but don't change the estimate yourself):* ${answers.estimateExceeded}

*Work remaining:* ${answers.workRemaining}

*Time remaining:* ${answers.timeRemaining}

*Completion date:* ${answers.completionDate}

*Blockers or dependencies:* ${answers.blockers}`;
}
