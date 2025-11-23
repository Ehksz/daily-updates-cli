import { createInterface } from 'node:readline/promises';
import { PromptOptions, ConfirmOptions } from '../types.js';

export async function prompt(options: PromptOptions): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const promptText = options.defaultValue
    ? `${options.prompt} [${options.defaultValue}]: `
    : `${options.prompt}: `;

  const answer = await rl.question(promptText);
  rl.close();
  const trimmed = answer.trim();
  return (trimmed || options.defaultValue) ?? '';
}

export async function confirm(options: ConfirmOptions): Promise<boolean> {
  const defaultVal = options.defaultValue ?? true;
  const suffix = defaultVal ? '(Y/n)' : '(y/N)';
  const answer = await prompt({
    prompt: `${options.prompt} ${suffix}`,
  });

  if (!answer) {
    return defaultVal;
  }

  const normalized = answer.toLowerCase();
  return normalized === 'y' || normalized === 'yes';
}

export async function promptArray(promptText: string): Promise<readonly string[]> {
  const input = await prompt({ prompt: promptText });
  if (!input) {
    return [];
  }
  return input.split(/\s+/).filter((item) => item.length > 0);
}
