# Open source checklist

Two things force this file to exist. The shadcn registry directory only accepts registries
that are open source and publicly accessible (`docs/REGISTRY.md`), and `npx shadcn add` is
a stranger running code from your domain — the repo has to earn that in the first thirty
seconds or the install never happens.

The rule that governs everything below: **community infrastructure is not product scope.**
A LICENSE is not a feature. Nothing in this checklist adds a runtime dependency, an effect,
a page, or a build step a user can see. `SCOPE.md` and `CLAUDE.md` still outrank this file.
Section 7 is where the pressure to add tooling goes to wait its turn.

Boxes are `[x]` only when the thing is actually in the repo. Section 6 is unticked because
none of it can be committed — it lives in GitHub settings.

---

## 1. Legal — blocking for the shadcn directory PR

- [x] `LICENSE` at the repo root, MIT. Permissive is not a default here, it is a
      requirement: users paste effect files into closed-source products, so anything
      copyleft makes the product unusable for its actual audience.
- [x] `license` field in `package.json` so the machine-readable answer matches the file.
- [x] README states plainly that installed effect code carries no attribution
      requirement. People *ask* this before they install; answering it up front removes
      the only real hesitation a designer has about a copy-paste registry.
- [x] `author` on every `registry.json` item — already present, keep it that way.

## 2. Identity — what the repo says before anyone reads code

- [x] README opens with what it is, the install command, and who it is *not* for. The
      "not for high-frequency app chrome" line is the credibility line; it goes above the
      fold, not in a footer.
- [x] All twelve effects listed in the README with their install URLs, so the repo is
      useful without visiting the site.
- [x] CI and license badges — the two that carry information. No badge that only says
      the project exists.
- [x] `package.json` carries `description`, `homepage`, `repository`, `bugs`, `keywords`.
      GitHub, npm search, and half the AI crawlers read these even though this package is
      never published.
- [x] `private: true` stays. The registry JSON is the distribution (`SCOPE.md`); the flag
      is what stops a stray `npm publish` from creating a package nobody should install.

## 3. Contribution path

- [x] `CONTRIBUTING.md` at the root, leading with the scope freeze. A contributor who
      learns about the frozen 12 *after* building an effect is a contributor you lose.
- [x] Issue form for bug reports, scoped to effect behaviour.
- [x] Issue form for effect proposals that requires an **Intent** and a **Not this**.
      Same shape as `SCOPE.md`. A slug alone is a category, not a design — the form
      refuses to accept the category.
- [x] Blank issues disabled, with contact links routed to the right place.
- [x] PR template whose checklist is the real gate: one file, zero dependencies,
      `target` path, `docs/MOTION.md`, registry rebuilt, installed from a throwaway
      project.
- [x] `.github/CODE_OF_CONDUCT.md` — Contributor Covenant 2.1, with a real reporting
      address rather than a placeholder.
- [x] No CLA and no DCO, stated out loud in `CONTRIBUTING.md`. For single-file effects
      the friction costs more than the paperwork is worth.

## 4. Security

- [x] `.github/SECURITY.md` with a private reporting route and an honest scope. The threat
      model for this project is not the marketing site — it is an effect file that ends up
      pasted into someone else's production app. Say that, and name what qualifies.
- [x] Dependabot for `npm` and `github-actions`, monthly and grouped. Monthly because a
      twelve-file registry with zero runtime dependencies does not need weekly noise; the
      GitHub Actions ecosystem is included because pinned action versions rot silently.

## 5. Verification — the one piece of automation allowed before v1

`CLAUDE.md` permits a build check and nothing more. The workflow is exactly that, plus one
check that is specific to this project being a registry:

- [x] `.github/workflows/ci.yml` runs lint, then `registry:build`, then `next build`, on
      every PR and every push to `main`.
- [x] **Registry drift check** — after rebuilding, `git diff --exit-code -- public/r` must
      be clean. `docs/REGISTRY.md` calls a stale `public/r` the single most common way to
      ship a broken item. This turns that from a discipline problem into a red X.
- [x] `build` is now `registry:build && next build`, as `docs/REGISTRY.md` always
      specified. Deploys can no longer publish JSON that is older than the source.
- [x] `permissions: contents: read` on the workflow, and concurrency cancellation. Least
      privilege by default so a later workflow has to opt into write access on purpose.
- [x] `.nvmrc` + `engines`, and CI reads the Node version from `.nvmrc` so there is one
      place to change it.
- [x] `.editorconfig` and `.gitattributes` so a contributor on another OS does not open a
      PR that is 90% line-ending churn.
- [x] `.gitignore` pruned to what this repo can actually produce, and it carries a comment
      saying `public/r/` is generated but deliberately **not** ignored. Without that note,
      the next person to tidy the file removes the distribution.

> **Known red.** The first CI run fails, and it is failing correctly. `npm run lint`
> reports `react-hooks/set-state-in-effect` in `liquid-fill-button.tsx:71` and
> `magnetic-button.tsx:38` — both call `setState` in an effect body to read the initial
> value of a `matchMedia` query. Both predate this workflow. The lint step is deliberately
> **not** `continue-on-error`: a green check that ignores a real failure is worth less than
> no check. Fix them through `/fix-motion` — they are shipped effect files, so the change
> needs a motion review, a `registry:build`, and a re-verified install, not a drive-by edit
> in a chore commit.

## 6. GitHub settings — cannot be committed, do these by hand

- [ ] Repo **description**: `Hover effects for React and Tailwind. Copy, paste, no dependencies.`
- [ ] Repo **topics**: `react`, `tailwindcss`, `shadcn-ui`, `shadcn-registry`, `hover-effects`,
      `css-animation`, `nextjs`, `ui-components`
- [ ] Website field → `https://hoverui.com`
- [ ] **Private vulnerability reporting** on (Settings → Security). `SECURITY.md` points
      at it and the link 404s until it is enabled.
- [ ] **Discussions** on. Effect ideas that are not yet in scope need somewhere to live
      that is not a stale issue backlog.
- [ ] Branch protection on `main`: require the CI check, require a PR.
- [ ] Social preview image — this is a visual product and the link is the pitch.
- [ ] Disable Wiki and Projects. Unused tabs read as abandonment.

## 7. Deliberately deferred

Every row is a real best practice that is wrong *right now*. The unfreeze column is what
stops this table from being an excuse.

| Not yet | Why | Unfreezes when |
|---|---|---|
| Test suite | Hover is pointer state and timing. Unit tests on it pass while the effect looks wrong, which is worse than no tests because they buy false confidence. | All 12 live. Then Playwright on reduced-motion and keyboard-focus behaviour only — never on visual output. |
| Changesets / release automation | Nothing is versioned. The install URL is the API and `docs/REGISTRY.md` forbids renaming a slug. | Never, unless the registry starts shipping breaking changes to existing slugs. |
| npm package | `SCOPE.md`, explicitly. The registry JSON is the distribution. | Never. This one is a load-bearing no. |
| Storybook / MDX docs | `SCOPE.md`. The gallery is the documentation and the previews are the real shipped files. | Never at v1 scope. |
| Semantic-release, commitlint, Husky | One maintainer, one effect per commit. Enforcement tooling costs more than the convention. | A second regular committer. |
| `all-contributors` | There are no contributors yet. Adding the bot first is cargo cult. | Third external merged PR. |
| `FUNDING.yml` | Nothing to fund before one stranger has installed it. | Post-launch, and only if the weekly cadence in `docs/LAUNCH.md` actually holds. |
| CodeQL / OSSF Scorecard | No server, no secrets, no user input. Scanning a static JSON generator is theatre. | The registry gains any dynamic endpoint. |

## 8. Before the directory PR

The pre-flight for `shadcn-ui/ui` (`docs/REGISTRY.md`), all of which section 1–6 exists to
satisfy:

- [ ] Repo public, LICENSE present, README explains install
- [ ] `https://hoverui.com/r/registry.json` reachable and current
- [ ] All 12 items install clean from a fresh project
- [ ] CI green on `main`
