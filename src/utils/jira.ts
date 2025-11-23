import { TicketInfo } from '../types.js';

export function buildJiraUrl(company: string, ticketKey: string): string {
  return `https://${company}.atlassian.net/browse/${ticketKey}`;
}

export function createTicketInfo(
  company: string,
  ticketKey: string
): Omit<TicketInfo, 'accomplishments'> {
  return {
    key: ticketKey,
    url: buildJiraUrl(company, ticketKey),
  };
}

export function formatTicketsAsMarkdown(tickets: readonly TicketInfo[]): string {
  return tickets.map((ticket) => `- [${ticket.key}](${ticket.url})`).join('\n');
}

export function formatTicketsAsBulletList(tickets: readonly TicketInfo[]): string {
  return tickets.map((ticket) => `* [${ticket.key}](${ticket.url})`).join('\n');
}

export function normalizeProducerHandle(handle: string): string {
  const trimmed = handle.trim();
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}
