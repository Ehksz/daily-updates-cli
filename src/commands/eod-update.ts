import chalk from 'chalk';
import { prompt, promptArray, confirm } from '../utils/prompt.js';
import { createTicketInfo, normalizeProducerHandle } from '../utils/jira.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { formatEodMessage } from '../formatters/eod.js';
import { EodUpdateAnswers, Accomplishment, CompletedTicket, PullRequest } from '../types.js';
import { getUserOpenPullRequests } from 'jira-utils';
import jiraConfig from '../../jira.config.json' assert { type: 'json' };

async function collectAccomplishments(): Promise<readonly Accomplishment[]> {
  const accomplishments: Accomplishment[] = [];

  for (;;) {
    const text = await prompt({
      prompt: 'What did you accomplish today? (one item per entry)',
    });

    if (text) {
      accomplishments.push({ text });
    }

    const more = await confirm({
      prompt: 'Anything else accomplished?',
      defaultValue: true,
    });

    if (!more) {
      break;
    }
  }

  return accomplishments;
}

async function collectCompletedTickets(company: string): Promise<readonly CompletedTicket[]> {
  const completed: CompletedTicket[] = [];

  for (;;) {
    const ticketKey = await prompt({
      prompt: 'Any ticket completed today? (enter ticket key like ABC-123, or leave blank if none)',
    });

    if (!ticketKey) {
      break;
    }

    let openPullRequests: { branchName: string; title: string; prLink: string }[] = [];
    try {
      openPullRequests = await getUserOpenPullRequests({
        workspace: jiraConfig.workspace,
        issueKey: ticketKey,
        selectedUser: 'cxviera',
        username: jiraConfig.email,
        apiToken: jiraConfig.bitbucketToken,
      });
    } catch {
      console.log(chalk.yellow('Could not fetch PRs for ticket:', ticketKey));
    }

    const ticket = createTicketInfo(company, ticketKey);
    completed.push({
      ...ticket,
      pullRequests: openPullRequests,
    });

    const more = await confirm({
      prompt: 'Any other tickets completed?',
      defaultValue: true,
    });

    if (!more) {
      break;
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
      console.log(
        chalk.cyan('\nFound open PR:'),
        chalk.green(firstPR.title),
        chalk.dim(`(${firstPR.branchName})`)
      );
      console.log(chalk.dim(firstPR.prLink));

      const useFetchedPr = await confirm({
        prompt: 'Use this PR?',
        defaultValue: true,
      });

      if (useFetchedPr) {
        return {
          label: firstPR.branchName,
          url: firstPR.prLink,
        };
      }
    }
  }

  const hasPr = await confirm({
    prompt: 'Is there a pull request for the completed work?',
    defaultValue: ticketsWithPRs.length === 0,
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

  const producerInput = await prompt({
    prompt: 'Who is the producer? (e.g. @alex)',
  });
  const producer = normalizeProducerHandle(producerInput);

  const company = await prompt({
    prompt: 'Jira company subdomain (company in https://company.atlassian.net)',
  });

  const ticketKeys = await promptArray(
    'Ticket keys you worked on today (space-separated, e.g. ABC-123 DEF-456)'
  );

  const tickets = ticketKeys.map((key) => createTicketInfo(company, key));

  const accomplishments = await collectAccomplishments();

  const completedTickets = await collectCompletedTickets(company);

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
    accomplishments,
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
