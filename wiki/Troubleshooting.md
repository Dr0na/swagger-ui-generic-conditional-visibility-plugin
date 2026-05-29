# Troubleshooting

## Swagger UI

| Symptom | Fix |
|---------|-----|
| No dropdowns | Operation missing `x-conditional` in `/v3/api-docs` |
| `SwaggerUIGenericConditionalVisibilityPlugin is not defined` | Load plugin **before** `swagger-initializer.js`; use inline script (springdoc transformer) |
| Wrong example/schema | Check `x-conditional-schema-map` keys match `keyJoin` (default `\|`) |
| Full `oneOf` still shown | All selectors must be set; check `mode` is `cascade-bound-body` or `body-bound` |
| Layout error “No layout defined” | Use `BaseLayout` or include standalone preset (see demos) |

## springdoc

| Symptom | Fix |
|---------|-----|
| Plugin not in page source | `@Primary` `SwaggerIndexTransformer`; component scan |
| Transformer not applied | URL must match `**/swagger-ui/**/index.html` |
| Two transformers | Only one `@Primary` bean |

## Demos / Pages

| Symptom | Fix |
|---------|-----|
| GitHub Pages 404 | Enable Pages → **GitHub Actions**; re-run deploy workflow |
| Broken styles on dark background | Demos use light `#swagger-ui` panel — see `demo/shared/demo.css` |
| `dist/` 404 locally | Run `npm run build` first |

## Build

| Symptom | Fix |
|---------|-----|
| Maven starter fails | Run `npm run build` before `mvn package` in `spring-boot-starter/` |
| Screenshots fail | `npx playwright install chromium`; server on port 9081 for `npm run screenshots` |

## Get help

- [Bug report](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/issues/new?template=bug_report.yml)
- [Security advisory](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/security/advisories/new) (private)
