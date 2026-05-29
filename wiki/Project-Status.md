# Project status

Last updated for release **v1.0.0** (May 2026).

## Summary

| Area | Status |
|------|--------|
| **Plugin core** | Stable — `src/plugin.js` → `dist/generic-conditional-visibility-plugin.js` |
| **OpenAPI contract** | Documented in repo [EXTENSION-CONTRACT.md](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/docs/EXTENSION-CONTRACT.md) |
| **Demos** | Catalog (2 path selectors), Deployments (path + path + header) |
| **GitHub Pages** | Workflow ready — enable **Settings → Pages → GitHub Actions** if not live |
| **Spring Boot starter** | Available via `mvn install` from `spring-boot-starter/`; Maven Central pending |
| **CI** | Green on `main` (build + Maven) |
| **Security** | Dependabot enabled; Playwright dev dep kept current |

## Current release

- **Tag:** [v1.0.0](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/releases/tag/v1.0.0)
- **Assets:** plugin JS bundle, Spring Boot starter JAR, checksums
- **Global:** `window.SwaggerUIGenericConditionalVisibilityPlugin`

## Compatibility (tested targets)

| Component | Version |
|-----------|---------|
| Swagger UI | 5.18.x (demos use unpkg CDN) |
| OpenAPI | 3.x |
| Spring Boot | 3.x |
| springdoc-openapi | 2.8.x (starter) |
| Node (build) | 20.x |

## Known limitations (v1)

- UI-only — no server-side validation
- WebFlux requires manual index transformer (no starter yet)
- springdoc `swagger-initializer.js` string replace may need adjustment on major springdoc upgrades
- Cookie parameters not supported as selectors

## Health checks

- [Actions](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/actions)
- [Dependabot](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/security/dependabot)
- [Open issues](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/issues)
