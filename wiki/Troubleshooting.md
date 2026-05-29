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

## Demos

| Symptom | Fix |
|---------|-----|
| Online demo URL does not load | Try [[Live-Demos#run-locally]] or check [GitHub Pages status](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/deployments/github-pages) |
| Dropdowns missing | Hard-refresh the page; confirm you expanded the POST operation |
| Body never unlocks | Select **every** selector in order (see [[Live-Demos#what-to-do-in-each-demo]]) |
| Broken colours / contrast | Known quirk: dark page chrome + light Swagger UI panel — content inside the white panel should be readable |

## Contributors (build & publish)

| Symptom | Fix |
|---------|-----|
| `dist/` 404 locally | Run `npm run build` first |
| Maven starter fails | Run `npm run build` before `mvn package` in `spring-boot-starter/` |
| GitHub Pages 404 for everyone | Repo maintainer: Settings → Pages → **GitHub Actions**, re-run **Deploy GitHub Pages** |
| Screenshots / wiki sync fail | See [docs/DEMOS.md](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/docs/DEMOS.md) and [docs/WIKI.md](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/docs/WIKI.md) |

## Get help

- [Bug report](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/issues/new?template=bug_report.yml)
- [Security advisory](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/security/advisories/new) (private)
