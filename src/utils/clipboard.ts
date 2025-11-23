import clipboard from 'clipboardy';
import chalk from 'chalk';

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await clipboard.write(text);
    console.log(chalk.green('\n✓ Copied to clipboard!'));
  } catch (error) {
    console.error(chalk.yellow('\n⚠ Could not copy to clipboard.'));
    if (error instanceof Error) {
      console.error(chalk.dim(error.message));
    }
  }
}
