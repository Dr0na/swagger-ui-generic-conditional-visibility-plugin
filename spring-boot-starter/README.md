# Spring Boot starter

Auto-configuration for **swagger-ui-generic-conditional-visibility-plugin** with [springdoc-openapi](https://springdoc.org/) (Spring MVC).

## Build

From the repository root:

```bash
npm run build
cd spring-boot-starter
mvn install
```

## Use in a service

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
</dependency>
<dependency>
  <groupId>io.github.vnalwar</groupId>
  <artifactId>swagger-ui-generic-conditional-visibility-spring-boot-starter</artifactId>
  <version>1.0.0</version>
</dependency>
```

Add `x-conditional` extensions to your OpenAPI (see [../docs/SPRINGDOC.md](../docs/SPRINGDOC.md)).

## Configuration

| Property | Default | Description |
|----------|---------|-------------|
| `swagger.ui.conditional-visibility.enabled` | `true` | Turn plugin registration on/off |
| `swagger.ui.conditional-visibility.plugin-location` | `swagger-ui-plugins/generic-conditional-visibility-plugin.js` | Classpath bundle path |
| `swagger.ui.conditional-visibility.expose-static-resource` | `false` | Expose `/swagger-ui-plugins/**` |

## Disable

```yaml
swagger:
  ui:
    conditional-visibility:
      enabled: false
```
