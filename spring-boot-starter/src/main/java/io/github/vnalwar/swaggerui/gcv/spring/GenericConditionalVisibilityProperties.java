package io.github.vnalwar.swaggerui.gcv.spring;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration for the generic conditional-visibility Swagger UI plugin.
 */
@ConfigurationProperties(prefix = "swagger.ui.conditional-visibility")
public class GenericConditionalVisibilityProperties {

    /**
     * Register the plugin with springdoc Swagger UI when springdoc is on the classpath.
     */
    private boolean enabled = true;

    /**
     * Classpath location of the plugin bundle (copied into the starter JAR at build time).
     */
    private String pluginLocation = "swagger-ui-plugins/generic-conditional-visibility-plugin.js";

    /**
     * Expose {@code /swagger-ui-plugins/**} for debugging. Not required when the index
     * transformer inlines the script (default).
     */
    private boolean exposeStaticResource = false;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getPluginLocation() {
        return pluginLocation;
    }

    public void setPluginLocation(String pluginLocation) {
        this.pluginLocation = pluginLocation;
    }

    public boolean isExposeStaticResource() {
        return exposeStaticResource;
    }

    public void setExposeStaticResource(boolean exposeStaticResource) {
        this.exposeStaticResource = exposeStaticResource;
    }
}
