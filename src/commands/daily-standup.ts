import chalk from 'chalk';
import { prompt, promptArray, promptMore } from '../utils/prompt.js';
import { createTicketInfo, normalizeProducerHandle } from '../utils/jira.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { formatStandupMessage } from '../formatters/standup.js';
import { DailyStandupAnswers, TicketInfo } from '../types.js';
import { getMyIssueKeys } from 'jira-utils';
import jiraConfig from '../../jira.config.json' assert { type: 'json' };

async function collectAccomplishmentsForTicket(ticketKey: string): Promise<string[]> {
  const accomplishments: string[] = [];

  const text = await prompt({
    prompt: `What did you accomplish in ${ticketKey}?`,
  });

  if (text) {
    accomplishments.push(text);

    for (;;) {
      const nextText = await promptMore('Anything else for this ticket?');
      if (!nextText) {
        break;
      }
      accomplishments.push(nextText);
    }
  }

  return accomplishments;
}

async function main(): Promise<void> {
  console.log(chalk.bold.cyan('\n=== Daily Standup Questions (Markdown) ===\n'));

  console.log(chalk.dim('Fetching your issue keys...'));
  const issueKeys = await getMyIssueKeys({
    host: jiraConfig.host,
    email: jiraConfig.email,
    apiToken: jiraConfig.apiToken,
    batchSize: 100,
    delayMs: 250,
  });
  console.log(chalk.green(`✓ Found ${String(issueKeys.length)} issue keys\n`));

  const producerInput = await prompt({
    prompt: 'Who is the producer? (e.g. @alex)',
  });
  const producer = normalizeProducerHandle(producerInput);

  const company = await prompt({
    prompt: 'Jira company subdomain (company in https://company.atlassian.net)',
  });

  const ticketKeys = await promptArray(
    "Ticket keys you're working on (space-separated, Tab for autocomplete)",
    issueKeys
  );

  const tickets: TicketInfo[] = [];
  for (const key of ticketKeys) {
    const ticket = createTicketInfo(company, key);
    const accomplishments = await collectAccomplishmentsForTicket(key);
    tickets.push({
      ...ticket,
      accomplishments,
    });
  }

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
