# Spring Boot integration

Full guide in the repo: **[docs/SPRINGDOC.md](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/docs/SPRINGDOC.md)**.

## Recommended: auto-configuration

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
</dependency>
<dependency>
  <groupId>io.github.dr0na</groupId>
  <artifactId>swagger-ui-generic-conditional-visibility-spring-boot-starter</artifactId>
  <version>1.0.0</version>
</dependency>
```

Install starter from source until Maven Central:

```bash
npm run build
cd spring-boot-starter && mvn install
```

## Configuration

```yaml
swagger:
  ui:
    conditional-visibility:
      enabled: true
      expose-static-resource: false
```

## What it does

1. `@Primary` `SwaggerIndexTransformer` inlines the plugin before `swagger-initializer.js`
2. Registers `SwaggerUIGenericConditionalVisibilityPlugin` in the Swagger UI `plugins` array
3. You still add `x-conditional*` via annotations or `OpenApiCustomizer`

## WebFlux

Use manual configuration with `org.springdoc.webflux.ui.SwaggerIndexPageTransformer` — see SPRINGDOC.md Option B.

## Verify

1. View source on Swagger UI `index.html` — inline script marker `swagger-ui-generic-conditional-visibility-plugin`
2. Check `/v3/api-docs` for extensions on your operation
3. Expand operation — cascading dropdowns and gated body

[Troubleshooting](Troubleshooting) for common springdoc issues.
