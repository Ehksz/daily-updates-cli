import { createInterface } from 'node:readline/promises';
import { PromptOptions, ConfirmOptions } from '../types.js';

export async function prompt(options: PromptOptions): Promise<string> {
  const completer = options.autocomplete
    ? (line: string): [string[], string] => {
        if (!options.autocomplete) {
          return [[], line];
        }
        const hits = options.autocomplete.filter((c) => c.startsWith(line));
        return [hits, line];
      }
    : undefined;

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    completer,
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

export async function promptArray(
  promptText: string,
  autocomplete?: string[]
): Promise<readonly string[]> {
  const options: PromptOptions = autocomplete
    ? { prompt: promptText, autocomplete }
    : { prompt: promptText };
  const input = await prompt(options);
  if (!input) {
    return [];
  }
  return input.split(/\s+/).filter((item) => item.length > 0);
}

export async function promptMore(
  morePrompt = 'Anything else?',
  autocomplete?: string[]
): Promise<string | null> {
  const options: PromptOptions = autocomplete
    ? { prompt: `${morePrompt} (or press enter to skip)`, autocomplete }
    : { prompt: `${morePrompt} (or press enter to skip)` };
  const answer = await prompt(options);
  const normalized = answer.toLowerCase().trim();

  if (!normalized || normalized === 'no' || normalized === 'n') {
    return null;
  }

  return answer;
}
