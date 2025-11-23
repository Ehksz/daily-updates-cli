import chalk from 'chalk';
import { prompt, promptArray, confirm, promptMore } from '../utils/prompt.js';
import { createTicketInfo, normalizeProducerHandle } from '../utils/jira.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { formatEodMessage } from '../formatters/eod.js';
import { EodUpdateAnswers, CompletedTicket, PullRequest, TicketInfo } from '../types.js';
import { getUserOpenPullRequests, getMyIssueKeys } from 'jira-utils';
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

async function collectCompletedTickets(
  company: string,
  issueKeys: string[]
): Promise<readonly CompletedTicket[]> {
  const completed: CompletedTicket[] = [];

  const ticketKey = await prompt({
    prompt: 'Any ticket completed today? (Tab for autocomplete)',
    autocomplete: issueKeys,
  });

  if (ticketKey) {
    let openPullRequests: { branchName: string; title: string; prLink: string }[] = [];
    try {
      openPullRequests = await getUserOpenPullRequests({
        workspace: jiraConfig.workspace,
        issueKey: ticketKey,
        selectedUser: 'cxviera',
        username: jiraConfig.email,
        apiToken: jiraConfig.bitbucketToken,
      });

      if (openPullRequests.length > 0 && openPullRequests[0]) {
        const firstPR = openPullRequests[0];
        console.log(
          chalk.cyan('\nFound open PR:'),
          chalk.green(firstPR.title),
          chalk.dim(`(${firstPR.branchName})`)
        );
        console.log(chalk.dim(firstPR.prLink));

        const usePR = await confirm({
          prompt: 'Use this PR for the report?',
          defaultValue: true,
        });

        if (!usePR) {
          openPullRequests = [];
        }
      }
    } catch {
      console.log(chalk.yellow('Could not fetch PRs for ticket:', ticketKey));
    }

    const ticket = createTicketInfo(company, ticketKey);
    completed.push({
      ...ticket,
      pullRequests: openPullRequests,
    });

    for (;;) {
      const nextTicket = await promptMore('Any other tickets completed?', issueKeys);
      if (!nextTicket) {
        break;
      }

      let nextPRs: { branchName: string; title: string; prLink: string }[] = [];
      try {
        nextPRs = await getUserOpenPullRequests({
          workspace: jiraConfig.workspace,
          issueKey: nextTicket,
          selectedUser: 'cxviera',
          username: jiraConfig.email,
          apiToken: jiraConfig.bitbucketToken,
        });

        if (nextPRs.length > 0 && nextPRs[0]) {
          const firstPR = nextPRs[0];
          console.log(
            chalk.cyan('\nFound open PR:'),
            chalk.green(firstPR.title),
            chalk.dim(`(${firstPR.branchName})`)
          );
          console.log(chalk.dim(firstPR.prLink));

          const usePR = await confirm({
            prompt: 'Use this PR for the report?',
            defaultValue: true,
          });

          if (!usePR) {
            nextPRs = [];
          }
        }
      } catch {
        console.log(chalk.yellow('Could not fetch PRs for ticket:', nextTicket));
      }

      const nextTicketInfo = createTicketInfo(company, nextTicket);
      completed.push({
        ...nextTicketInfo,
        pullRequests: nextPRs,
      });
    }
  }

  return completed;
}

async function collectPullRequest(
  completedTickets: readonly CompletedTicket[]
): Promise<PullRequest | null> {
  if (completedTickets.length === 0) {
    return null;
  }

  const ticketsWithPRs = completedTickets.filter((ticket) => ticket.pullRequests.length > 0);

  if (ticketsWithPRs.length > 0) {
    const firstTicket = ticketsWithPRs[0];
    if (firstTicket?.pullRequests[0]) {
      const firstPR = firstTicket.pullRequests[0];
      return {
        label: firstPR.branchName,
        url: firstPR.prLink,
      };
    }
  }

  const hasPr = await confirm({
    prompt: 'Is there a pull request for the completed work?',
    defaultValue: false,
  });

  if (!hasPr) {
    return null;
  }

  const firstTicket = completedTickets[0];
  if (!firstTicket) {
    return null;
  }

  const defaultLabel =
    completedTickets.length === 1 ? `fix/${firstTicket.key}` : `fix/${firstTicket.key}-etc`;

  const label = await prompt({
    prompt: 'Pull request label (e.g. branch name)',
    defaultValue: defaultLabel,
  });

  const repo = await prompt({
    prompt: 'Bitbucket repo path (e.g. studiollc/connective-backend)',
  });

  const prNumber = await prompt({
    prompt: 'Pull request number (e.g. 361)',
  });

  const url = `https://bitbucket.org/${repo}/pull-requests/${prNumber}`;

  return { label, url };
}

async function main(): Promise<void> {
  console.log(chalk.bold.cyan('\n=== End of Day Update (Slack Markdown) ===\n'));

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
    'Ticket keys you worked on today (space-separated, Tab for autocomplete)',
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

  const completedTickets = await collectCompletedTickets(company, issueKeys);

  const status = await prompt({
    prompt: 'Current status/progress',
  });

  const pullRequest = await collectPullRequest(completedTickets);

  const blockers = await prompt({
    prompt: 'Blockers or issues',
  });

  const tomorrow = await prompt({
    prompt: 'Plan for tomorrow',
  });

  const answers: EodUpdateAnswers = {
    producer,
    company,
    tickets,
    completedTickets,
    status,
    pullRequest,
    blockers,
    tomorrow,
  };

  const output = formatEodMessage(answers);

  console.log(chalk.bold.green('\n=== Generated Slack Markdown Message ===\n'));
  console.log(output);

  await copyToClipboard(output);
}

main().catch((error: unknown) => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
