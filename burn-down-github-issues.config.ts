/**
 * Repository config for the burn-down-github-issues skill
 * (https://github.com/simiancraft/simiancraft-skills), which works this repository's issues through
 * draft pull requests. Everything true of this repository lives here. Run from the repo root:
 *
 *   bun run <skill-dir>/loop.ts --dry-run
 */
export default {
  /**
   * The checks a landing must show green, by name, read off pull request #52. The main-protection
   * ruleset requires 'Lint, Typecheck, Test' and is unioned in. Release is skipped on pull
   * requests by design, so it is not listed.
   */
  requiredChecks: ['Lint, Typecheck, Test', 'Analyze (actions)', 'Analyze (javascript-typescript)'],

  /** Installed apps that open a check suite on every push and run nothing in it (queued, zero runs, on #52). */
  idleCheckSuiteApps: ['expo', 'simiancraft-banana-bot', 'sonarqubecloud', 'claude'],

  project: {
    name: 'chromonym',
    repo: 'simiancraft/chromonym',
    remote: 'origin',
    baseBranch: 'main',
    evidenceBranch: '__evidence_locker__',
    /**
     * The demo installs the package (`file:..`) as a copy, so it sees only the `dist/` that existed when
     * it was installed: build, reinstall the demo, then check.
     */
    checkCommand: 'bun run build && (cd demo && bun install --frozen-lockfile) && bun run check',
    installCommand: 'bun install --frozen-lockfile',
    conventionDocs: ['AGENTS.md', 'CONTRIBUTING.md', 'NOTICE.md'],
    sizingScale:
      'no repository page; use story points where 1 is a single-file change with its test and 2 is one new palette or a contained change within one area',
    sharedServices: ['the npm registry', 'the GitHub Pages demo deployment'],
    portBase: 43000,
    portSpan: 1000,
    /** Source and tests use relative imports; the demo imports the package root, which builds from src. */
    pathAliases: [{ prefix: 'chromonym', dir: 'src' }],
    sourceExtensions: ['.ts', '.tsx', '.js', '.jsx'],
    alwaysInvalidates: [
      'package.json',
      'bun.lock',
      'bunfig.toml',
      'tsconfig',
      'biome.json',
      'knip.json',
      'codecov.yml',
      '.releaserc.json',
      'demo/package.json',
      'demo/bun.lock',
      'demo/tsconfig.json',
      'demo/eslint.config.js',
      'demo/vite.config.ts',
      'scripts/',
      '.github/workflows/',
    ],
    /** semantic-release rewrites the changelog on every releasing merge; the version bump is recognized automatically. */
    releaseArtifacts: ['CHANGELOG.md'],
    touchPaths: {
      migration: [],
      ci: ['.github/workflows/', '.releaserc.json'],
    },
    worktreeRoot: '../.chromonym-loop',
  },
};
