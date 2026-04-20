# Security policy

## Supported versions

Only the latest major receives security fixes.

| Version | Supported |
|---------|-----------|
| 3.x     | ✓         |
| < 3.0   | ✗         |

## Reporting a vulnerability

Report security issues **privately** via GitHub Security Advisories — open [a new advisory](https://github.com/simiancraft/chromonym/security/advisories/new) on this repository. If that route is not available to you, email **info@simiancraft.com**.

Please do **not** open a public GitHub issue for security reports.

You should receive an acknowledgement within **3 business days**. We aim to ship a patch (or publish a mitigation plan) within **14 days** of a confirmed report.

## Scope

Chromonym is a pure-function library with no network, filesystem, or auth surface. Realistic in-scope issues:

- **ReDoS** in palette normalizer regexes, or any regex path reachable from user input.
- **Prototype pollution** via untrusted input objects (BYO palettes, structural `convert` inputs).
- **Supply-chain** issues affecting the published package — compromised dev-dep, tampered release artifact, or typosquatting of the `chromonym` name.
- **Publish hygiene** — credentials, test fixtures, or unintended build artifacts shipped to npm.

### Out of scope

- **Incorrect color values or nearest-match results.** These are bugs — file a regular [GitHub issue](https://github.com/simiancraft/chromonym/issues).
- **Bugs in other libraries** (`color.js`, `chroma.js`, etc.) — report upstream.
- **Theoretical ReDoS** with sub-quadratic complexity on realistic inputs.
