import chalk from 'chalk';
import { prompt, promptArray } from '../utils/prompt.js';
import { createTicketInfo, normalizeProducerHandle } from '../utils/jira.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { formatStandupMessage } from '../formatters/standup.js';
import { DailyStandupAnswers } from '../types.js';

async function main(): Promise<void> {
  console.log(chalk.bold.cyan('\n=== Daily Standup Questions (Markdown) ===\n'));

  const producerInput = await prompt({
    prompt: 'Who is the producer? (e.g. @alex)',
  });
  const producer = normalizeProducerHandle(producerInput);

  const company = await prompt({
    prompt: 'Jira company subdomain (company in https://company.atlassian.net)',
  });

  const ticketKeys = await promptArray(
    "Ticket keys you're working on (space-separated, e.g. ABC-123 DEF-456)"
  );

  const tickets = ticketKeys.map((key) => createTicketInfo(company, key));

  const estimateExceeded = await prompt({
    prompt:
      "Will any of these tickets exceed the original estimate? If so, what should the estimates be changed to? (notify the producer, but don't change the estimate yourself)",
  });

  const workRemaining = await prompt({
    prompt: 'Work remaining',
  });

  const timeRemaining = await prompt({
    prompt: 'Time remaining',
  });

  const completionDate = await prompt({
    prompt: 'Completion date',
  });

  const blockers = await prompt({
    prompt: 'Blockers or dependencies',
  });

  const answers: DailyStandupAnswers = {
    producer,
    company,
    tickets,
    estimateExceeded,
    workRemaining,
    timeRemaining,
    completionDate,
    blockers,
  };

  const output = formatStandupMessage(answers);

  console.log(chalk.bold.green('\n=== Generated Markdown Message ===\n'));
  console.log(output);

  await copyToClipboard(output);
}

main().catch((error: unknown) => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
