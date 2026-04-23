# Contributing to chromonym

Thanks for considering a contribution. This project is small and opinionated; the bar for merging is high, but the review is friendly.

## Prerequisites

- [Bun](https://bun.sh) 1.3+ (package manager + test runner)
- Node.js is not required to develop against this repo; Bun runs the TypeScript sources directly.

## Setup

```sh
git clone https://github.com/simiancraft/chromonym.git
cd chromonym
bun install
```

## Common tasks

| Task | Command |
|---|---|
| Run all tests | `bun test` |
| Run a single test file | `bun test test/conversions/rgb.test.ts` |
| Typecheck | `bun run typecheck` |
| Lint | `bun run lint` |
| Auto-fix lint | `bun run lint:fix` |
| Format | `bun run format` |
| Build the library | `bun run build` |
| Run the demo app | `bun run demo` |
| Validate npm packaging | `bun run check:package` |
| Find unused exports | `bun run check:knip` |

## Commit style

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). `semantic-release` reads the commit log on every push to `main` and cuts patch/minor/major releases automatically — so the commit type matters:

- `fix: ...` → patch release
- `feat: ...` → minor release
- `feat!: ...` or `BREAKING CHANGE:` footer → major release
- `chore: ...`, `docs: ...`, `test: ...`, `refactor: ...`, `ci: ...` → no release

Scopes are optional but helpful (e.g. `fix(rgb): ...`, `feat(palettes): ...`).

## Pull requests

- Open a PR against `main`. CI must be green before review.
- Keep the diff focused. One logical change per PR.
- Add or update tests for any behavior change. Coverage is tracked; reductions are scrutinized.
- Update the README or JSDoc if you change a public API surface.
- Merge strategy: merge-commits (preserves individual commit semantics for semantic-release).

## Reporting issues

- Bugs: [open an issue](https://github.com/simiancraft/chromonym/issues/new/choose).
- Security: see [SECURITY.md](./SECURITY.md). **Do not** file public issues for vulnerabilities — use GitHub Security Advisories or email info@simiancraft.com.

## Code of conduct

This project follows the [Contributor Covenant 2.1](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.
