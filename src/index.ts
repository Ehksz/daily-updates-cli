import { Command } from 'commander';

const program = new Command();

program
  .name('daily-digest')
  .description('CLI tool for generating daily standup and end-of-day updates')
  .version('1.0.0');

program
  .command('standup')
  .description('Generate daily standup message')
  .action(async () => {
    await import('./commands/daily-standup.js');
  });

program
  .command('eod')
  .description('Generate end-of-day update message')
  .action(async () => {
    await import('./commands/eod-update.js');
  });

program.parse();
