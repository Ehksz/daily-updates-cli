# Daily Digest CLI

A strictly type-safe Node.js TypeScript CLI application for generating daily standup and end-of-day updates with Jira integration.

## Features

- 🔒 **Strictly Type-Safe**: No `any`, `unknown`, or unsafe types
- 📦 **ES Modules**: Modern module system
- 🎨 **Prettier**: Code formatting
- 🔍 **ESLint**: Strict linting with TypeScript rules
- 📝 **Commitizen**: Conventional commit messages
- ⚡ **Lefthook**: Fast Git hooks manager written in Go
- 🛠️ **Commander**: Clean CLI interface
- 📋 **Clipboard Support**: Auto-copy generated messages

## Installation

```bash
npm install
```

## Setup

Initialize Lefthook hooks:

```bash
npm run prepare
```

This will install Git hooks automatically.

## Build

```bash
npm run build
```

## Usage

### Daily Standup

```bash
npm run build
node dist/commands/daily-standup.js
```

Or after building:

```bash
daily-standup
```

### End of Day Update

```bash
npm run build
node dist/commands/eod-update.js
```

Or after building:

```bash
eod-update
```

## Development

### Type Check

```bash
npm run type-check
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Format

```bash
npm run format
npm run format:check
```

### Commit

Use Commitizen for conventional commits:

```bash
npm run commit
```

Or with git directly (Lefthook will validate commit messages):

```bash
git commit
```

## Git Hooks (Lefthook)

Lefthook is a fast Git hooks manager written in Go that runs in parallel for better performance.

### Pre-commit Hook

Runs on every commit and executes in parallel:

- **Lint**: ESLint with auto-fix for staged TypeScript files
- **Format**: Prettier formatting for staged TypeScript files
- **Type Check**: Full TypeScript type checking

All fixed files are automatically staged.

### Commit-msg Hook

- Validates commit messages against conventional commit format using commitlint
- Ensures consistent commit history

### Lefthook Commands

```bash
# Install hooks
lefthook install

# Uninstall hooks
lefthook uninstall

# Run specific hook manually
lefthook run pre-commit

# Run pre-commit on all files (not just staged)
lefthook run pre-commit --all-files

# Skip hooks for a single commit
LEFTHOOK=0 git commit -m "bypass hooks"
```

### Local Configuration

Create `lefthook-local.yml` to override settings locally (git-ignored):

```yml
pre-commit:
  commands:
    type-check:
      skip: true # Skip type checking locally if needed
```

## Project Structure

```
.
├── src/
│   ├── commands/
│   │   ├── daily-standup.ts
│   │   └── eod-update.ts
│   ├── formatters/
│   │   ├── standup.ts
│   │   └── eod.ts
│   ├── utils/
│   │   ├── clipboard.ts
│   │   ├── jira.ts
│   │   └── prompt.ts
│   ├── types.ts
│   └── index.ts
├── dist/              # Build output
├── lefthook.yml       # Git hooks configuration
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── commitlint.config.js
```

## TypeScript Configuration

The project uses the strictest TypeScript settings:

- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `noPropertyAccessFromIndexSignature: true`

## License

MIT
