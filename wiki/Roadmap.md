# Roadmap

Planned direction for **swagger-ui-generic-conditional-visibility-plugin**. Timelines are indicative; priorities may shift based on issues and PRs.

## Shipped (v1.0.0)

- [x] Generic `x-conditional*` OpenAPI extensions (path / query / header)
- [x] Modes: `cascade-bound-body`, `cascade-only`, `body-bound`
- [x] Request-body gating and schema/example resolution
- [x] Static demos + GitHub Pages
- [x] Spring Boot auto-configuration starter (WebMVC + springdoc)
- [x] CI, releases, Dependabot, community health files

## Near term

| Item | Goal |
|------|------|
| **Maven Central** | Publish `swagger-ui-generic-conditional-visibility-spring-boot-starter` for one-line dependency |
| **WebFlux starter** | Auto-config for `springdoc-openapi-starter-webflux-ui` |
| **npm package** | Optional publish of `generic-conditional-visibility-plugin.js` |
| **Wiki ↔ repo sync** | Script/Action to publish `wiki/` from main branch |

## Medium term

| Item | Goal |
|------|------|
| **Query/cookie edge cases** | Document and test parameter edge cases (duplicate names, case) |
| **Plugin config UI** | Document advanced `SwaggerUIGenericConditionalVisibilityPlugin({ ... })` options |
| **OpenAPI 3.1 examples** | Broader validation with springdoc-generated specs |
| **Try it out** | Optional integration when `tryItOutEnabled` is on (today demos often disable it) |

## Longer term / ideas

- Expression-based conditions (beyond static maps)
- Async enum loading from a secondary URL
- OpenAPI Generator / spectral rules for extension linting
- Visual schema diff when switching selectors

## How to influence the roadmap

1. Open a [feature request issue](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/issues/new?template=feature_request.yml)
2. Comment on existing issues with use cases
3. Submit a PR (see [Contributing](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/CONTRIBUTING.md))

Breaking changes to the **extension contract** require a major version and updates to [EXTENSION-CONTRACT.md](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/docs/EXTENSION-CONTRACT.md).
