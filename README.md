# swagger-ui-generic-conditional-visibility

A **domain-neutral** Swagger UI plugin that drives cascading parameter selectors and optional request-body schema/example resolution from OpenAPI extensions—no vendor- or product-specific field names.

Use it for any API where:

- Several **path**, **query**, or **header** parameters must be chosen in order, and
- The **request body** shape (or example JSON) depends on that combination.

**Related project:** [swagger-ui-conditional-visibility](../swagger-ui-conditional-visibility) is an older, log-source–focused variant. This repository is the generic replacement; the original repo is unchanged.

---

## Documentation

| Document | Audience | Contents |
|----------|----------|----------|
| [README.md](./README.md) | Integrators | Quick start, features, registration |
| [docs/EXTENSION-CONTRACT.md](./docs/EXTENSION-CONTRACT.md) | API authors | Full OpenAPI extension specification |
| [docs/EXAMPLES.md](./docs/EXAMPLES.md) | API authors | Patterns: 2-level, 3-level, query/header, maps-only |
| [DEVELOPING.md](./DEVELOPING.md) | Plugin authors | Architecture, build, extend, debug |

---

## Features

- **Any selector depth** — 1 to N parameters in declared order
- **path / query / header** — per-selector `in` in `x-conditional.selectors`
- **Generic extensions** — `x-conditional`, `x-conditional-enum-map`, `x-conditional-schema-map`, `x-conditional-example-map`, `x-visibility`
- **Request body gating** — hide Example/Schema until all selectors are set
- **Resolved schema** — inject full component schema (not a misleading `oneOf` list)
- **Configurable** — custom extension names, `keyJoin`, `leafKeyOnly` via plugin factory config

---

## Quick start

### 1. Build

```bash
npm run build
```

Output: `dist/generic-conditional-visibility-plugin.js`  
Global: `SwaggerUIGenericConditionalVisibilityPlugin`

### 2. Load script

```html
<script src="/swagger-ui/swagger-ui-bundle.js"></script>
<script src="/swagger-ui-plugins/generic-conditional-visibility-plugin.js"></script>
<script src="/swagger-ui/swagger-initializer.js"></script>
```

### 3. Register plugin

```javascript
window.ui = SwaggerUIBundle({
  url: "/v3/api-docs",
  dom_id: "#swagger-ui",
  plugins: [
    SwaggerUIBundle.plugins.DownloadUrl,
    () => SwaggerUIGenericConditionalVisibilityPlugin(),
  ],
  presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
  layout: "StandaloneLayout",
});
```

With options:

```javascript
plugins: [
  () =>
    SwaggerUIGenericConditionalVisibilityPlugin({
      keyJoin: "::",
      leafKeyOnly: false,
    }),
],
```

### 4. Annotate your OpenAPI operation

```yaml
post:
  x-conditional:
    mode: cascade-bound-body
    selectors:
      - { name: region, in: path }
      - { name: tier, in: path }
  x-conditional-enum-map:
    region:
      us-east:
        tier: [gold, silver]
  x-conditional-schema-map:
    us-east|gold: GoldConfig
    us-east|silver: SilverConfig
  x-conditional-example-map:
    us-east|gold: { replicas: 3 }
```

See [docs/EXTENSION-CONTRACT.md](./docs/EXTENSION-CONTRACT.md) for the full contract.

---

## Minimal OpenAPI checklist

1. Operation has `x-conditional` with `selectors` (ordered).
2. Each selector matches a real parameter (`name` + `in`).
3. Provide `x-conditional-enum-map` and/or `x-visibility.when` on schemas for dropdown values.
4. For body resolution: `x-conditional-schema-map` + optional `x-conditional-example-map` keyed by `keyJoin`.
5. Register `SwaggerUIGenericConditionalVisibilityPlugin` in Swagger UI `plugins`.

---

## Behaviour summary

| User action | Plugin behaviour |
|-------------|------------------|
| Opens operation | Banner shows resolved-schema panel (empty until complete) |
| Incomplete selectors | Request body section shows guidance text only |
| Changes selector at level *i* | Clears all deeper selectors and request body |
| Completes all selectors | Shows filtered schema, example JSON, Try-it-out body |

---

## Repository layout

```
├── src/plugin.js              # Plugin implementation
├── scripts/build.mjs          # IIFE bundle
├── dist/                      # Build output (gitignored)
├── docs/
│   ├── EXTENSION-CONTRACT.md
│   └── EXAMPLES.md
├── examples/sample-openapi.yaml
├── README.md
└── DEVELOPING.md
```

---

## License

Apache-2.0
