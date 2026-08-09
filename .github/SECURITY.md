# Security policy

## The threat model

HoverUI's risk is not the marketing site. It is that **an effect file gets pasted into
somebody else's production app**. A user runs `npx shadcn@latest add
https://hoverui.com/r/<slug>.json`, a `.tsx` file lands in their repo, and it ships to
their visitors. That trust is the thing worth protecting.

## Supported

| What | Supported |
|---|---|
| The live registry at `https://hoverui.com/r/*` | Yes |
| `main` in this repo | Yes |
| Effect code already copied into your project | Report it — we will fix the source and say so publicly |
| Forks and mirrors of the registry JSON | No |

Nothing here is versioned; there is one live registry and one supported branch.

## Reporting

**Do not open a public issue.**

Use GitHub's private vulnerability reporting:
<https://github.com/raqibnur/hoverui/security/advisories/new>

If that is unavailable, email **raqibnur24@gmail.com** with `SECURITY` in the subject.

Please include the slug, what an attacker gets, and the smallest reproduction you can
manage. A working repro on a fresh `create-next-app` is worth more than a long writeup.

## What to expect

- **Acknowledgement within 72 hours.** This is a single-maintainer project — if you have
  not heard back in a week, ping the issue tracker without describing the vulnerability.
- Fixes ship to `main` and the live registry together, because there are no versions to
  backport to.
- Credit in the release note unless you ask otherwise.
- No bounty. There is no money in this project.

Please give a reasonable window before public disclosure. There is no fixed embargo — for
a static registry a fix is usually a same-day commit.

## In scope

- An effect that introduces XSS in a consuming app — `dangerouslySetInnerHTML`, unescaped
  user content, an event handler built from a string
- Registry JSON at `hoverui.com/r/*` serving content that does not match the reviewed
  source in this repo
- A registry item writing outside `components/hover/`, or otherwise overwriting a file the
  user did not expect
- An item that silently pulls a dependency — this violates rule 2 in `CLAUDE.md` and is a
  supply-chain issue, not just a style one
- Compromise of the build or deploy pipeline

## Out of scope

- Missing security headers on the marketing site — it is static, unauthenticated, and
  holds no user data
- Vulnerabilities in `next`, `react`, or other dev dependencies with no exploitable path
  through this project. Report those upstream; Dependabot handles the bumps here.
- Rate limiting, DoS, or volumetric attacks on `hoverui.com`
- Missing `prefers-reduced-motion` support or other accessibility bugs. These matter and
  we want them fixed — but as a normal issue, not a security report.
