# Contributing

Thank you for contributing to **swagger-ui-generic-conditional-visibility-plugin**. This document covers setup, change types, and how to submit work.

By participating, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Ways to contribute

- Bug reports and reproductions (OpenAPI + Swagger UI version)
- Documentation improvements ([`docs/`](./docs/), README, demos)
- Plugin behavior fixes and features in [`src/plugin.js`](./src/plugin.js)
- Spring Boot starter changes in [`spring-boot-starter/`](./spring-boot-starter/)
- Demo scenarios under [`demo/`](./demo/)
- Tests and CI improvements

## Before you start

1. Search [existing issues](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/issues) to avoid duplicates.
2. For large changes, open an issue first to discuss approach (especially OpenAPI extension contract changes).
3. Extension contract changes must update [docs/EXTENSION-CONTRACT.md](./docs/EXTENSION-CONTRACT.md) and [docs/EXAMPLES.md](./docs/EXAMPLES.md).

## Development setup

```bash
git clone https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin.git
cd swagger-ui-generic-conditional-visibility-plugin
npm ci
npm run build
```

### Run demos locally

```bash
npm run demo
# http://localhost:9080/demo/
```

### Spring Boot starter

```bash
npm run build
cd spring-boot-starter && mvn package
```

Requires **Java 17+** and **Maven 3.9+**.

### Regenerate screenshots (optional)

```bash
npx playwright install chromium   # once
npm run screenshots
```

Commit updated PNGs under `docs/images/` when UI behavior visible to users changes.

### GitHub Pages preview

```bash
npm run pages:prepare
npx http-server site -p 9080
```

## Making changes

| Area | Location |
|------|----------|
| Plugin source | `src/plugin.js` |
| Built bundle (do not edit by hand) | `dist/` — run `npm run build` |
| Demos | `demo/` |
| Spring auto-config | `spring-boot-starter/` |
| User docs | `docs/` |

Keep diffs focused. Match existing style (plain JS, minimal dependencies).

## Pull request checklist

- [ ] `npm run build` succeeds
- [ ] Demos work locally (`npm run demo`) or Pages layout verified (`npm run pages:prepare`)
- [ ] If `src/plugin.js` changed: behavior described in PR; screenshots updated if UX changed
- [ ] If extensions changed: `docs/EXTENSION-CONTRACT.md` updated
- [ ] If starter changed: `docs/SPRINGDOC.md` and `spring-boot-starter/README.md` updated
- [ ] No unrelated files (no `dist/` or `site/` in the PR — they are gitignored)
- [ ] Commits are logical; PR description explains **why**

CI runs on every PR ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)).

## Commit messages

Use clear, imperative subjects, for example:

- `Fix cascade reset when header selector changes`
- `Document springdoc property for disabling auto-config`
- `Add demo for single path selector`

## Releases

Maintainers cut releases by pushing a `v*` tag; [`.github/workflows/release.yml`](./.github/workflows/release.yml) attaches assets. Version bumps should update `package.json`, `spring-boot-starter/pom.xml`, and [CHANGELOG.md](./CHANGELOG.md).

## Security

See [SECURITY.md](./SECURITY.md). Do not file public issues for vulnerabilities.

## Questions

Open a [GitHub Discussion](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/discussions) if enabled, or an issue labeled `question`.
