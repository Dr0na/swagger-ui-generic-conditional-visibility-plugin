package io.github.vnalwar.swaggerui.gcv.spring;

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
 * Inlines the generic conditional-visibility plugin before swagger-initializer.js and
 * registers {@code window.SwaggerUIGenericConditionalVisibilityPlugin} in the plugins array.
 */
public class GenericConditionalVisibilityIndexTransformer extends SwaggerIndexPageTransformer {

    public static final String PLUGIN_MARKER = "swagger-ui-generic-conditional-visibility-plugin";
    public static final String PLUGIN_GLOBAL = "window.SwaggerUIGenericConditionalVisibilityPlugin";

    private final String pluginClasspathLocation;

    public GenericConditionalVisibilityIndexTransformer(
            SwaggerUiConfigProperties swaggerUiConfig,
            SwaggerUiOAuthProperties swaggerUiOAuthProperties,
            SwaggerWelcomeCommon swaggerWelcomeCommon,
            ObjectMapperProvider objectMapperProvider,
            String pluginClasspathLocation) {
        super(swaggerUiConfig, swaggerUiOAuthProperties, swaggerWelcomeCommon, objectMapperProvider);
        this.pluginClasspathLocation = pluginClasspathLocation;
    }

    @Override
    public Resource transform(HttpServletRequest request, Resource resource, ResourceTransformerChain chain)
            throws IOException {
        AntPathMatcher matcher = new AntPathMatcher();
        String url = resource.getURL().toString();

        if (matcher.match("**/swagger-ui/**/index.html", url)) {
            String html = readStreamAsString(resource.getInputStream());
            html = injectPluginScript(html);
            return new TransformedResource(resource, html.getBytes(StandardCharsets.UTF_8));
        }

        if (matcher.match("**/swagger-ui/**/swagger-initializer.js", url)) {
            Resource transformed = super.transform(request, resource, chain);
            if (!(transformed instanceof TransformedResource transformedResource)) {
                return transformed;
            }
            String js = readStreamAsString(transformedResource.getInputStream());
            js = registerPlugin(js);
            return new TransformedResource(resource, js.getBytes(StandardCharsets.UTF_8));
        }

        return resource;
    }

    private String injectPluginScript(String html) throws IOException {
        if (html.contains(PLUGIN_MARKER)) {
            return html;
        }
        ClassPathResource pluginResource = new ClassPathResource(pluginClasspathLocation);
        if (!pluginResource.exists()) {
            return html;
        }
        String pluginJs = readStreamAsString(pluginResource.getInputStream());
        String inlineScript =
                "<script charset=\"UTF-8\">/* " + PLUGIN_MARKER + " */\n" + pluginJs + "\n</script>\n    ";
        return html.replace(
                "<script src=\"./swagger-initializer.js\"",
                inlineScript + "<script src=\"./swagger-initializer.js\"");
    }

    static String registerPlugin(String js) {
        if (js.contains(PLUGIN_GLOBAL)) {
            return js;
        }
        return js.replace(
                "SwaggerUIBundle.plugins.DownloadUrl",
                "SwaggerUIBundle.plugins.DownloadUrl,\n      " + PLUGIN_GLOBAL);
    }

    private static String readStreamAsString(InputStream in) throws IOException {
        return StreamUtils.copyToString(in, StandardCharsets.UTF_8);
    }
}
