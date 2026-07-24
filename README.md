# myGit

A minimal, educational implementation of Git's core plumbing and porcelain commands, written in TypeScript.

`myGit` re-implements the essential parts of Git from scratch — content-addressable object storage, tree/commit objects, refs, an index, and a small set of familiar commands — to explore how Git actually works under the hood.

## Features

Implemented commands:

| Command | Description |
|---|---|
| `init` | Initialize a new repository (`.mygit` directory, `HEAD`, empty index) |
| `add <path>` \| `add .` | Stage a file (or every tracked file in the working tree) |
| `rm <path>` | Remove a file from the index and the working tree |
| `status` | Show staged, modified, deleted, and untracked files |
| `write-tree` | Build a tree object from the current index |
| `commit-tree <tree-hash> -m <message>` | Create a commit object pointing at a tree |
| `commit -m <message>` | Shortcut for `write-tree` + `commit-tree` |
| `log` | Walk the commit history from `HEAD` |
| `cat-file <hash>` | Inspect a stored blob, tree, or commit object |
| `branch <name>` | Create a new branch pointing at the current commit |
| `checkout <branch>` | Switch branches and restore the working tree |
| `restore <path>` | Restore a single file from the current commit |

Objects are stored zlib-compressed under `.mygit/objects`, addressed by SHA-1, the same way Git does it.

## Requirements

- Node.js 22+
- npm

## Installation

```bash
git clone <repo-url>
cd myGit
npm install
```

## Usage

Run commands via `tsx` during development:

```bash
npx tsx src/cli/cli.ts init
npx tsx src/cli/cli.ts add .
npx tsx src/cli/cli.ts commit -m "Initial commit"
npx tsx src/cli/cli.ts log
```

Or build first and run the compiled output:

```bash
npm run build
node dist/cli/cli.js status
```

A `.mygitignore` file in the repository root (same format as `.gitignore`) can be used to exclude files from `add`/`status`/scanning.

## Project layout

```
src/
  cli/            Argument parsing and command routing
  configs/        Repository path resolution (.mygit/*)
  container/      Dependency-injection wiring (services + commands)
  core/
    commands/     One class per CLI command (Add, Commit, Checkout, ...)
    objects/      Git object model: BlobObject, TreeObject, CommitObject
    refs/         HEAD / branch ref storage
    repository/   Repository initialization
  infrastructure/ Thin wrappers around Node APIs: fs, zlib, sha1
  services/       Higher-level services: index, object store, file scanner,
                  ignore rules, tree building/reading, working-tree restore
  utils/          Logging, path normalization, tree-building helpers
```

The dependency direction is `cli → container → core/commands → services → infrastructure`, with every service exposed through an interface (`I*`) so it can be mocked in tests.

## Development

```bash
npm test            # run the Jest test suite
npm run test:watch  # watch mode
npm run test:coverage
npm run lint        # ESLint
npm run lint:fix    # ESLint --fix + Prettier
npm run build        # compile to dist/
```

Tests live next to the code they cover (`*.test.ts`) and mock the `I*` interfaces rather than touching the real filesystem, so the suite is fast and deterministic.

## Status

This project is a learning exercise, not a Git replacement — it doesn't implement packfiles, remotes, merging, rebasing, or most of Git's edge cases. Contributions and experiments are welcome.
