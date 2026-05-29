# OpenAPI extensions

Normative detail lives in the repository: **[EXTENSION-CONTRACT.md](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/docs/EXTENSION-CONTRACT.md)**.

## Overview

| Extension | On | Purpose |
|-----------|-----|---------|
| `x-conditional` | Operation | Selectors, `mode`, `keyJoin` |
| `x-conditional-enum-map` | Operation | Cascading allowed values |
| `x-conditional-schema-map` | Operation | Key → component schema name |
| `x-conditional-example-map` | Operation | Key → example object |
| `x-visibility` | Schema | `when` for enum derivation |

## Minimal example

```yaml
post:
  x-conditional:
    mode: cascade-bound-body
    keyJoin: "|"
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
```

## Modes

| Mode | Cascading | Body gated | Resolved schema |
|------|-----------|------------|-----------------|
| `cascade-bound-body` | Yes | Yes | Yes |
| `cascade-only` | Yes | No | No |
| `body-bound` | Yes | Yes | Yes |

## More patterns

[EXAMPLES.md](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/docs/EXAMPLES.md) — header selectors, query params, deeper nesting.

## Plugin registration

```javascript
plugins: [
  SwaggerUIBundle.plugins.DownloadUrl,
  () => SwaggerUIGenericConditionalVisibilityPlugin(),
]
```

Optional factory config: custom `extensionNames`, `keyJoin`, `leafKeyOnly` — see [Developer guide](Developer-Guide).
