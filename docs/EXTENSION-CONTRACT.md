# OpenAPI extension contract

This document is the normative specification for OpenAPI metadata consumed by **swagger-ui-generic-conditional-visibility**. Any valid OpenAPI 3.x document can use these extensions; there are no domain-specific names.

## Overview

| Extension | Location | Required | Purpose |
|-----------|----------|----------|---------|
| `x-conditional` | Operation | Yes (to activate) | Declares selectors, mode, key format |
| `x-conditional-enum-map` | Operation | No* | Nested allowed values per selector |
| `x-conditional-schema-map` | Operation | No** | Selection key → component schema name |
| `x-conditional-example-map` | Operation | No** | Selection key → example JSON |
| `x-visibility` | Schema | No* | `when` object for enum derivation |

\* Required unless `x-conditional-enum-map` is omitted and every combination is inferable from `x-visibility` on schemas and/or `x-conditional-schema-map` keys.

\** Required for request-body resolution when `mode` includes body binding.

## `x-conditional`

Attached to an **operation** (GET, POST, etc.).

### Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | string | `cascade-bound-body` | Behaviour preset (see [Modes](#modes)) |
| `selectors` | string \| array | `[]` | Ordered selector definitions |
| `keyJoin` | string | `\|` (plugin default) | Join character for composite map keys |
| `leafKeyOnly` | boolean | `false` | If `true`, schema/example maps use only the last selector value as key |

Legacy alias: `and-visibility: vendor-device-bound` is treated as `cascade-bound-body` for migration from older plugins.

### `selectors` formats

**Comma-separated names** (all assumed `in: path`):

```yaml
selectors: region,tier,channel
```

**Array of names** (all `in: path`):

```yaml
selectors:
  - region
  - tier
```

**Array of objects** (any `in`):

```yaml
selectors:
  - name: region
    in: path
  - name: tier
    in: path
  - name: X-Channel
    in: header
  - name: filter
    in: query
```

Supported `in` values: `path`, `query`, `header` (case-insensitive).

Parameter **name** and **in** must match an existing operation parameter so Swagger UI’s `parameterRow` wrap can replace the correct row.

### Modes

| Mode | Cascading selects | Request body gating | Body schema filter |
|------|-------------------|---------------------|-------------------|
| `cascade-bound-body` | Yes | Yes | Yes |
| `cascade-only` | Yes | No | No |
| `body-bound` | Yes* | Yes | Yes |

\* `body-bound` still uses selectors for map keys; UI shows selects for declared parameters.

## `x-conditional-enum-map`

Nested map: **selector name → value → … → final selector → array of values**.

```yaml
x-conditional-enum-map:
  region:           # first selector name
    us-east:        # value of region
      tier:         # next selector name
        gold:       # value of tier
          X-Channel: [web, mobile]
        silver:
          X-Channel: [web]
    eu-west:
      tier:
        gold:
          X-Channel: [web]
```

Rules:

1. Top-level keys are **selector names** (not values).
2. Under each selector name, keys are **allowed values** for that selector at that level.
3. The deepest level lists the next selector name with an **array** of allowed values.
4. Depth must support all selectors in `x-conditional.selectors` order.

### Inferring enums without `x-conditional-enum-map`

If omitted, the plugin builds a tree from `components.schemas.*.x-visibility.when`:

```yaml
GoldWebDeployConfig:
  x-visibility:
    when:
      region: us-east
      tier: gold
      X-Channel: web
```

All schemas that share the same `when` prefix contribute branches at each level.

### Fallback from schema/example maps

If the tree has no branch at a level, option labels are derived from keys in `x-conditional-schema-map` that share the current selection prefix.

## `x-conditional-schema-map`

Maps a **selection key** to a component schema **name** (not a `$ref` path).

```yaml
x-conditional-schema-map:
  us-east|gold|web: GoldWebDeployConfig
  us-east|gold|mobile: GoldMobileDeployConfig
```

### Selection key

Built by joining selector values in order with `keyJoin` (default `|`):

```
{region}|{tier}|{X-Channel}  →  us-east|gold|web
```

With `leafKeyOnly: true`:

```
web   # only last selector (X-Channel)
```

Use `leafKeyOnly` only when the last selector value uniquely identifies the schema globally.

## `x-conditional-example-map`

Same keys as `x-conditional-schema-map`. Values are example objects or JSON strings.

```yaml
x-conditional-example-map:
  us-east|gold|web:
    replicaCount: 3
    ingressHost: app.example.com
```

When the final selector is chosen, the plugin sets the Try-it-out request body via `oas3Actions.setRequestBodyValue`.

## `x-visibility` (on schemas)

Documents which selector combination a schema represents. Used to build enum trees and for human readers.

```yaml
x-visibility:
  when:
    region: us-east
    tier: gold
    X-Channel: web
```

Shorthand (all keys other than `description` become `when`):

```yaml
x-visibility:
  region: us-east
  tier: gold
  X-Channel: web
```

## Complete operation example

See [examples/sample-openapi.yaml](../examples/sample-openapi.yaml).

## Validation expectations

The plugin is **UI-only**. It does not validate that:

- Map keys cover every enum combination
- Request body `oneOf` matches the resolved schema
- Server-side binding agrees with the maps

Your API implementation must enforce consistency. The plugin only improves Try-it-out UX.

## Custom extension names

Pass plugin config when registering:

```javascript
() =>
  SwaggerUIGenericConditionalVisibilityPlugin({
    extensionNames: {
      conditional: "x-my-conditional",
      enumMap: "x-my-enum-map",
      schemaMap: "x-my-schema-map",
      exampleMap: "x-my-example-map",
      visibility: "x-my-visibility",
    },
  })
```
