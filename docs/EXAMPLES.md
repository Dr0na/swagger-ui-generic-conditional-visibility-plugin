# Examples

Copy-paste patterns for common conditional-visibility setups. All extension names are generic; adjust paths and schema names for your API.

---

## Example 1 — Two path parameters (region + tier)

```yaml
paths:
  /items/{region}/{tier}:
    post:
      x-conditional:
        mode: cascade-bound-body
        selectors:
          - name: region
            in: path
          - name: tier
            in: path
      x-conditional-enum-map:
        region:
          us-east:
            tier: [gold, silver]
          eu-west:
            tier: [gold]
      x-conditional-schema-map:
        us-east|gold: GoldItemConfig
        us-east|silver: SilverItemConfig
        eu-west|gold: GoldItemConfig
      x-conditional-example-map:
        us-east|gold: { quota: 100 }
        us-east|silver: { quota: 50 }
      parameters:
        - name: region
          in: path
          required: true
          schema: { type: string }
        - name: tier
          in: path
          required: true
          schema: { type: string }
      requestBody:
        content:
          application/json:
            schema:
              oneOf:
                - $ref: "#/components/schemas/GoldItemConfig"
                - $ref: "#/components/schemas/SilverItemConfig"
```

**Composite keys:** `us-east|gold`, `us-east|silver`, `eu-west|gold`

---

## Example 2 — Path + query

```yaml
get:
  x-conditional:
    mode: cascade-only
    selectors:
      - name: accountId
        in: path
      - name: view
        in: query
  x-conditional-enum-map:
    accountId:
      acct-1:
        view: [summary, detail]
      acct-2:
        view: [summary]
  parameters:
    - name: accountId
      in: path
      required: true
      schema: { type: string }
    - name: view
      in: query
      required: true
      schema: { type: string }
```

`cascade-only` does not gate a request body—use when the operation has no body or body is static.

---

## Example 3 — Path + header (three levels)

See [examples/sample-openapi.yaml](../examples/sample-openapi.yaml) for a full document with `X-Channel` in **header**.

Important: header parameter names are case-sensitive and must match OpenAPI exactly (e.g. `X-Channel`).

---

## Example 4 — Enums from schemas only (no enum map)

```yaml
components:
  schemas:
    ConfigA:
      x-visibility:
        when:
          env: prod
          sku: A
    ConfigB:
      x-visibility:
        when:
          env: prod
          sku: B
```

```yaml
post:
  x-conditional:
    selectors:
      - { name: env, in: path }
      - { name: sku, in: path }
  x-conditional-schema-map:
    prod|A: ConfigA
    prod|B: ConfigB
```

The plugin builds `env → prod → sku → [A, B]` from schema `when` blocks.

---

## Example 5 — Leaf-only map keys

When the last selector value is globally unique:

```yaml
x-conditional:
  selectors: category,productCode
  leafKeyOnly: true
x-conditional-schema-map:
  SKU-991: Product991Config
  SKU-992: Product992Config
```

Keys in maps are `SKU-991`, not `electronics|SKU-991`.

---

## Example 6 — Custom key separator

```yaml
x-conditional:
  keyJoin: "::"
  selectors: a,b
x-conditional-schema-map:
  x::y: MySchema
```

---

## Example 7 — Plugin config for renamed extensions

If your organization already uses different extension names:

```javascript
SwaggerUIGenericConditionalVisibilityPlugin({
  extensionNames: {
    conditional: "x-acme-conditional",
    enumMap: "x-acme-enum-map",
    schemaMap: "x-acme-schema-map",
    exampleMap: "x-acme-example-map",
    visibility: "x-acme-visibility",
  },
})
```

OpenAPI must use those names on operations and schemas.

---

## Springdoc / Java (operation extension)

```java
@Extension(
    name = "x-conditional",
    properties = {
        @ExtensionProperty(name = "mode", value = "cascade-bound-body"),
        @ExtensionProperty(
            name = "selectors",
            value = "[{\"name\":\"region\",\"in\":\"path\"},{\"name\":\"tier\",\"in\":\"path\"}]",
            parseValue = true)
    })
```

Maps (`x-conditional-schema-map`, etc.) are easier to add in an `OpenApiCustomizer` bean than inline annotations.

---

## Testing in Swagger UI

1. Register the plugin (see [README](../README.md)).
2. Expand the operation.
3. Confirm each selector row is a `<select>` with `(path)`, `(query)`, or `(header)` hint.
4. Confirm request body is hidden until the last selector is chosen.
5. Change an early selector—deeper selectors and body should reset.
6. Schema tab should show the resolved component properties, not “One of” over all variants.
