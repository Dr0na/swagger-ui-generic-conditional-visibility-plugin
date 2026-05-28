# Spring Boot + springdoc integration

This guide wires **swagger-ui-generic-conditional-visibility-plugin** into any Spring Boot microservice that already uses [springdoc-openapi](https://springdoc.org/) (`springdoc-openapi-starter-webmvc-ui`).

---

## Option A — Spring Boot auto-configuration (recommended)

The repository includes a starter module that registers a `@Primary` `SwaggerIndexTransformer`, inlines the plugin bundle from the JAR, and exposes configuration properties.

### Dependency

Build the plugin bundle first (`npm run build` in this repo), then install the starter:

```xml
<dependency>
  <groupId>io.github.vnalwar</groupId>
  <artifactId>swagger-ui-generic-conditional-visibility-spring-boot-starter</artifactId>
  <version>1.0.0</version>
</dependency>
```

Until the starter is published to Maven Central, install from source:

```bash
npm run build
cd spring-boot-starter && mvn install
```

Your service must already depend on `springdoc-openapi-starter-webmvc-ui`. No `@Configuration` classes are required for the plugin itself.

### Properties

```yaml
swagger:
  ui:
    conditional-visibility:
      enabled: true                    # default: true
      plugin-location: swagger-ui-plugins/generic-conditional-visibility-plugin.js
      expose-static-resource: false    # optional /swagger-ui-plugins/** handler
```

Set `enabled: false` to disable the plugin without removing the dependency.

### What auto-configuration does

1. Registers `GenericConditionalVisibilityIndexTransformer` as `@Primary` `SwaggerIndexTransformer`.
2. Inlines `generic-conditional-visibility-plugin.js` (bundled in the starter JAR) before `swagger-initializer.js`.
3. Appends `window.SwaggerUIGenericConditionalVisibilityPlugin` to the Swagger UI `plugins` array.

You still add `x-conditional` and related maps to your OpenAPI (annotations or `OpenApiCustomizer`) — see [section 4](#4-publish-openapi-extensions-openapicustomizer).

### WebFlux

The starter targets **Spring MVC** + `springdoc-openapi-starter-webmvc-ui`. For WebFlux, use [manual configuration](#option-b--manual-configuration) with `org.springdoc.webflux.ui.SwaggerIndexPageTransformer`.

---

## Option B — Manual configuration

Use this when you cannot use the starter (custom transformer, WebFlux, or a forked plugin bundle path).

A `@Primary` `SwaggerIndexTransformer` **inlines** the plugin bundle into `index.html` and registers `SwaggerUIGenericConditionalVisibilityPlugin` in `swagger-initializer.js`. Inlining avoids race conditions and broken relative paths for external script tags.

---

## Prerequisites

| Item | Notes |
|------|--------|
| Spring Boot | 3.x recommended |
| springdoc | `springdoc-openapi-starter-webmvc-ui` 2.8.x (or compatible 2.x) |
| OpenAPI | Operations annotated with `x-conditional` and related maps — see [EXTENSION-CONTRACT.md](./EXTENSION-CONTRACT.md) |
| Built plugin | `dist/generic-conditional-visibility-plugin.js` from this repo (`npm run build`) |

---

## 1. Copy the plugin bundle (manual setup only)

Skip this section if you use the [Spring Boot starter](#option-a--spring-boot-auto-configuration-recommended).

From this repository:

```bash
npm run build
mkdir -p src/main/resources/static/swagger-ui-plugins
cp dist/generic-conditional-visibility-plugin.js \
  src/main/resources/static/swagger-ui-plugins/
```

Commit the file under `src/main/resources/static/swagger-ui-plugins/` so it is on the classpath at runtime.

**Global symbol after load:** `window.SwaggerUIGenericConditionalVisibilityPlugin` (factory function; call it when registering the plugin).

---

## 2. Register a `@Primary` index transformer (manual setup only)

springdoc serves Swagger UI through `SwaggerIndexPageTransformer`. Replace it with a subclass that:

1. For `**/swagger-ui/**/index.html` — inject an **inline** `<script>` containing the full plugin JS **immediately before** `<script src="./swagger-initializer.js"`.
2. For `**/swagger-ui/**/swagger-initializer.js` — append `window.SwaggerUIGenericConditionalVisibilityPlugin` to the `plugins` array (after `SwaggerUIBundle.plugins.DownloadUrl`).

### Configuration bean (`SwaggerUiPluginConfig`)

Copy into your application (adjust `com.example.myapp` to your base package):

```java
package com.example.myapp.config;

import org.springdoc.core.providers.ObjectMapperProvider;
import org.springdoc.core.properties.SwaggerUiConfigProperties;
import org.springdoc.core.properties.SwaggerUiOAuthProperties;
import org.springdoc.webmvc.ui.SwaggerIndexTransformer;
import org.springdoc.webmvc.ui.SwaggerWelcomeCommon;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class SwaggerUiPluginConfig {

    @Bean
    @Primary
    public SwaggerIndexTransformer swaggerIndexTransformer(
            SwaggerUiConfigProperties swaggerUiConfig,
            SwaggerUiOAuthProperties swaggerUiOAuthProperties,
            SwaggerWelcomeCommon swaggerWelcomeCommon,
            ObjectMapperProvider objectMapperProvider) {
        return new GenericConditionalVisibilityIndexTransformer(
                swaggerUiConfig, swaggerUiOAuthProperties, swaggerWelcomeCommon, objectMapperProvider);
    }
}
```

### Index transformer (`GenericConditionalVisibilityIndexTransformer`)

Complete class — inline script injection and plugin registration:

```java
package com.example.myapp.config;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.springdoc.core.properties.SwaggerUiConfigProperties;
import org.springdoc.core.properties.SwaggerUiOAuthProperties;
import org.springdoc.core.providers.ObjectMapperProvider;
import org.springdoc.webmvc.ui.SwaggerIndexPageTransformer;
import org.springdoc.webmvc.ui.SwaggerWelcomeCommon;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StreamUtils;
import org.springframework.web.servlet.resource.ResourceTransformerChain;
import org.springframework.web.servlet.resource.TransformedResource;

/**
 * Injects the generic conditional-visibility Swagger UI plugin into index.html (inline script,
 * so the global exists before swagger-initializer.js runs) and registers it in swagger-initializer.js.
 */
public class GenericConditionalVisibilityIndexTransformer extends SwaggerIndexPageTransformer {

    static final String PLUGIN_MARKER = "swagger-ui-generic-conditional-visibility-plugin";
    static final String PLUGIN_GLOBAL = "window.SwaggerUIGenericConditionalVisibilityPlugin";
    static final String PLUGIN_CLASSPATH =
            "static/swagger-ui-plugins/generic-conditional-visibility-plugin.js";

    public GenericConditionalVisibilityIndexTransformer(
            SwaggerUiConfigProperties swaggerUiConfig,
            SwaggerUiOAuthProperties swaggerUiOAuthProperties,
            SwaggerWelcomeCommon swaggerWelcomeCommon,
            ObjectMapperProvider objectMapperProvider) {
        super(swaggerUiConfig, swaggerUiOAuthProperties, swaggerWelcomeCommon, objectMapperProvider);
    }

    @Override
    public Resource transform(HttpServletRequest request, Resource resource, ResourceTransformerChain chain)
            throws IOException {
        AntPathMatcher matcher = new AntPathMatcher();
        String url = resource.getURL().toString();

        if (matcher.match("**/swagger-ui/**/index.html", url)) {
            String html = readFullyAsString(resource.getInputStream());
            html = injectPluginScript(html);
            return new TransformedResource(resource, html.getBytes(StandardCharsets.UTF_8));
        }

        if (matcher.match("**/swagger-ui/**/swagger-initializer.js", url)) {
            Resource transformed = super.transform(request, resource, chain);
            if (!(transformed instanceof TransformedResource transformedResource)) {
                return transformed;
            }
            byte[] bytes = transformedResource.getInputStream().readAllBytes();
            String js = new String(bytes, StandardCharsets.UTF_8);
            js = registerPlugin(js);
            return new TransformedResource(resource, js.getBytes(StandardCharsets.UTF_8));
        }

        return resource;
    }

    private String injectPluginScript(String html) throws IOException {
        if (html.contains(PLUGIN_MARKER)) {
            return html;
        }
        ClassPathResource pluginResource = new ClassPathResource(PLUGIN_CLASSPATH);
        if (!pluginResource.exists()) {
            return html;
        }
        String pluginJs = readFullyAsString(pluginResource.getInputStream());
        String inlineScript =
                "<script charset=\"UTF-8\">/* " + PLUGIN_MARKER + " */\n" + pluginJs + "\n</script>\n    ";
        return html.replace(
                "<script src=\"./swagger-initializer.js\"",
                inlineScript + "<script src=\"./swagger-initializer.js\"");
    }

    private static String registerPlugin(String js) {
        if (js.contains(PLUGIN_GLOBAL)) {
            return js;
        }
        return js.replace(
                "SwaggerUIBundle.plugins.DownloadUrl",
                "SwaggerUIBundle.plugins.DownloadUrl,\n      " + PLUGIN_GLOBAL);
    }

    private static String readFullyAsString(InputStream in) throws IOException {
        return StreamUtils.copyToString(in, StandardCharsets.UTF_8);
    }
}
```

**Why `@Primary`?** springdoc already defines a `SwaggerIndexTransformer` bean. Your bean must take precedence so injection and `swagger-initializer.js` transformation actually run.

**Why inline?** An external `<script src="/swagger-ui-plugins/...">` can load after `swagger-initializer.js`, so `SwaggerUIGenericConditionalVisibilityPlugin` is undefined when the UI starts. Inlining guarantees order.

---

## 3. Optional: serve the bundle as a static resource

If you also want to load the script from a URL (debugging, alternate pages), add a `WebMvcConfigurer`:

```java
package com.example.myapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SwaggerUiPluginResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/swagger-ui-plugins/**")
                .addResourceLocations("classpath:/static/swagger-ui-plugins/");
    }
}
```

This is **optional** for standard springdoc Swagger UI when you use the index transformer above (inline only).

---

## 4. Publish OpenAPI extensions (`OpenApiCustomizer`)

The plugin reads extensions from the spec Swagger UI loads (usually `/v3/api-docs`). You can:

- Hand-author `x-conditional`, `x-conditional-enum-map`, `x-conditional-schema-map`, and `x-conditional-example-map` in static OpenAPI/YAML, or
- Add them at runtime with `OpenApiCustomizer` (operation-level and/or schema-level `x-visibility`).

### Minimal operation-level example

```java
package com.example.myapp.config;

import io.swagger.v3.oas.models.Operation;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ConditionalVisibilityOpenApiConfig {

    @Bean
    public OpenApiCustomizer addConditionalExtensions() {
        return openApi -> {
            if (openApi.getPaths() == null) {
                return;
            }
            var pathItem = openApi.getPaths().get("/api/v1/widgets/{region}/{tier}");
            if (pathItem == null || pathItem.getPost() == null) {
                return;
            }
            Operation op = pathItem.getPost();

            Map<String, Object> conditional = new LinkedHashMap<>();
            conditional.put("mode", "cascade-bound-body");
            conditional.put("selectors", List.of(
                    Map.of("name", "region", "in", "path"),
                    Map.of("name", "tier", "in", "path")));
            op.addExtension("x-conditional", conditional);

            op.addExtension("x-conditional-enum-map", Map.of(
                    "us", Map.of("basic", List.of(), "pro", List.of()),
                    "eu", Map.of("basic", List.of())));

            op.addExtension("x-conditional-schema-map", Map.of(
                    "us|basic", "WidgetUsBasic",
                    "us|pro", "WidgetUsPro"));

            op.addExtension("x-conditional-example-map", Map.of(
                    "us|basic", Map.of("sku", "W-001")));
        };
    }
}
```

### Schema-level `x-visibility` (enum derivation)

When you omit `x-conditional-enum-map`, the plugin can derive allowed values from `components.schemas[*].x-visibility.when`. Example customizer fragment:

```java
import io.swagger.v3.oas.models.media.Schema;
import java.util.LinkedHashMap;
import java.util.Map;

// Inside your OpenApiCustomizer lambda, after openApi.getComponents() is non-null:
Schema<?> schema = openApi.getComponents().getSchemas().get("WidgetUsBasic");
if (schema != null) {
    Map<String, Object> when = new LinkedHashMap<>();
    when.put("region", "us");
    when.put("tier", "basic");
    Map<String, Object> visibility = new LinkedHashMap<>();
    visibility.put("when", when);
    schema.addExtension("x-visibility", visibility);
}
```

Align map keys with [EXTENSION-CONTRACT.md](./EXTENSION-CONTRACT.md) (`keyJoin`, `leafKeyOnly`). For copy-paste YAML patterns see [EXAMPLES.md](./EXAMPLES.md).

---

## 5. Verify integration

1. **Build and run** the service.
2. Open Swagger UI (default springdoc path, often `/swagger-ui.html` or `/swagger-ui/index.html` depending on version).
3. **View page source** on `index.html`:
   - Contains `/* swagger-ui-generic-conditional-visibility-plugin */` inside an inline script.
   - `swagger-initializer.js` (or transformed initializer) lists `window.SwaggerUIGenericConditionalVisibilityPlugin` in `plugins`.
4. **Fetch** `/v3/api-docs` (or your configured path) and confirm the target operation includes `x-conditional` and maps.
5. **Try it out** on that operation:
   - Cascading dropdowns appear for declared selectors.
   - Request body example/schema stay gated until all selectors are chosen, then show the resolved branch.

### Local refresh after plugin changes

```bash
# In this plugin repo
npm run build
cp dist/generic-conditional-visibility-plugin.js \
  /path/to/your-service/src/main/resources/static/swagger-ui-plugins/
# Restart Spring Boot; hard-refresh browser (cache)
```

---

## 6. Troubleshooting

| Symptom | Likely cause | What to do |
|---------|----------------|------------|
| No dropdowns; stock `oneOf` body | Plugin not registered | Confirm `@Primary` `SwaggerIndexTransformer` bean; check initializer contains `SwaggerUIGenericConditionalVisibilityPlugin`. |
| Console: `SwaggerUIGenericConditionalVisibilityPlugin is not defined` | Script load order | Use **inline** injection before `swagger-initializer.js`, not a late external script. |
| Inline comment missing in page source | Transformer not applied | Verify URL matches `**/swagger-ui/**/index.html`; confirm your config class is component-scanned. |
| `ClassPathResource` not found | Wrong path | File must be at `classpath:static/swagger-ui-plugins/generic-conditional-visibility-plugin.js`. |
| Extensions missing in UI | Spec not enriched | Inspect `/v3/api-docs`; fix `OpenApiCustomizer` or static OpenAPI. |
| Wrong example/schema | Map keys | Match `x-conditional-schema-map` / `x-conditional-example-map` keys to selector values (`keyJoin` default `\|`). |
| Changes ignored | Browser cache | Hard refresh; restart app after copying new `dist/` bundle. |
| Two transformers fighting | Missing `@Primary` | Only one `SwaggerIndexTransformer` should win; mark yours `@Primary`. |

### springdoc / Swagger UI version drift

If `swagger-initializer.js` no longer contains the exact string `SwaggerUIBundle.plugins.DownloadUrl`, adjust `registerPlugin()` to match the generated snippet (same approach as maintaining any string-replace transformer).

---

## Related docs

- [EXTENSION-CONTRACT.md](./EXTENSION-CONTRACT.md) — extension specification
- [EXAMPLES.md](./EXAMPLES.md) — YAML patterns
- [DEMOS.md](./DEMOS.md) — static demos without Spring Boot
- [../DEVELOPING.md](../DEVELOPING.md) — plugin internals and debug
