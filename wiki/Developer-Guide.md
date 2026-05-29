# Developer guide

Source: **[DEVELOPING.md](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/DEVELOPING.md)** in the repository.

## Quick setup

```bash
npm ci
npm run build
npm run demo
```

## Layout

| Path | Role |
|------|------|
| `src/plugin.js` | Plugin implementation |
| `scripts/build.mjs` | IIFE bundle → `dist/` |
| `demo/` | Static Swagger UI demos |
| `spring-boot-starter/` | Java auto-config |

## Architecture (summary)

- Swagger UI **component wrappers**: `parameterRow`, `operation`, `RequestBody`, `modelExample`
- **Redux** selection state per `path:method`
- OpenAPI read from `specSelectors.specJson()`
- Body updates via `oas3Actions.setRequestBodyValue`

## Build output

```bash
npm run build
# dist/generic-conditional-visibility-plugin.js
# global: SwaggerUIGenericConditionalVisibilityPlugin
```

## Publishing wiki from repo

```bash
npm run wiki:push
```

Requires Wiki enabled on GitHub and `github-Dr0na` SSH access.

## Contributing

See [CONTRIBUTING.md](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/CONTRIBUTING.md).
