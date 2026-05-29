# Getting started

## 1. Choose your integration

| You have… | Use… |
|-----------|------|
| Spring Boot + springdoc (MVC) | [[Spring-Boot-Integration]] — starter recommended |
| Custom Swagger UI host | Release JS + register plugin (below) |
| Evaluate only | [[Live-Demos]] |

## 2. Standalone Swagger UI (3 steps)

### Build or download the bundle

```bash
git clone https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin.git
cd swagger-ui-generic-conditional-visibility-plugin
npm ci && npm run build
```

Or download `generic-conditional-visibility-plugin.js` from [Releases](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/releases/latest).

### Register the plugin

```javascript
window.ui = SwaggerUIBundle({
  url: "/v3/api-docs",
  dom_id: "#swagger-ui",
  presets: [SwaggerUIBundle.presets.apis],
  layout: "BaseLayout",
  plugins: [
    SwaggerUIBundle.plugins.DownloadUrl,
    () => SwaggerUIGenericConditionalVisibilityPlugin(),
  ],
});
```

Global factory: `SwaggerUIGenericConditionalVisibilityPlugin`.

### Annotate operations

Minimal example:

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

Full spec: [[OpenAPI-Extensions]] and [EXAMPLES.md](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/docs/EXAMPLES.md).

## 3. Verify

1. Open Swagger UI and expand an operation with `x-conditional`.
2. Confirm dropdowns replace plain parameter inputs.
3. Confirm request body is hidden until all selectors are chosen.
4. Confirm Example/Schema match the selected combination.

If something fails, see [[Troubleshooting]].
