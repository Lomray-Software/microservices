# Pull-request service checks

`pr-check.yml` always runs the dependency-free selector tests and PR-title check.
The selector checks out the exact PR head, compares `base...head` with Git, and
emits a validated JSON `list` and a `has-services` boolean. Neither missing output
nor malformed input counts as a successful docs-only classification: a selector
error fails the upstream job. Run its tests locally with:

```sh
node --test .github/scripts/service-matrix.test.cjs
```

## Selection rules

- Changes confined to root README, license, code of conduct, Context7 config, the
  standalone `scripts/check-docs.cjs` documentation audit, or this explanation
  select `[]`. An actual empty diff also selects `[]`.
- Files inside a service select that exact directory once, including service
  documentation. Service names are discovered from real directories and valid
  manifests; lint, typecheck and test scripts must exist.
- Shared configuration, root manifests/locks, workflows, selector code/tests,
  templates, shared tests and unknown root files select all services. This is a
  conservative fallback, not a guessed documentation exemption.
- Deleted files and both sides of renamed files participate. An unknown or fully
  removed service is an error requiring explicit review, not a silent skip.
- Inputs with absolute paths, traversal, control characters or backslashes fail.
  Git paths use NUL separation; spaces in filenames are preserved.

Both service-code and Sonar jobs skip only after successful selection reports
`has-services=false`. Nonempty results feed both matrices. Sonar concurrency is
per service, so different services in the same PR do not cancel each other.

## Preserved code checks

The service job installs root dependencies with `npm ci`, then executes the same
commands previously dispatched by the CLI: `npm install`, `npm run lint:check`,
`npm run ts:check` and `npm run test`, each in the exact matrix service directory.
No fallback, ignored exit status, token substitution or relaxed check is added.
Service install intentionally remains `npm install`, matching the old CLI's
`global-install` default; this change does not silently impose a new lock policy.

Direct npm execution avoids the locked CLI's unsupported static JSON import
assertion and its substring-based `ONLY` filter. It is not a dependency upgrade.
The release workflows still use that CLI and are unchanged. The modified Node
jobs select supported Node 22; the check job logs the actual Node/npm versions.
A failure in service dependencies, lint, types, tests or Sonar remains a failure.

Release workflows and `.nvmrc` are unchanged. Their older runtime policy is not
validated by this repair. Aligning release and pull-request runtimes remains a
separate maintainer decision; these selector fixtures are not release tests.

The selector's fixture tests do not start services or prove that service suites
or Sonar pass. Those require authorized repository CI. Root documentation checks
are separate from service execution; skipping service checks is not a claim that
all documentation has been tested.
