package io.github.vnalwar.swaggerui.gcv.spring;

import org.springdoc.core.providers.ObjectMapperProvider;
import org.springdoc.core.properties.SwaggerUiConfigProperties;
import org.springdoc.core.properties.SwaggerUiOAuthProperties;
import org.springdoc.webmvc.ui.SwaggerIndexTransformer;
import org.springdoc.webmvc.ui.SwaggerWelcomeCommon;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Auto-configures springdoc Swagger UI to load the generic conditional-visibility plugin.
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnClass({SwaggerIndexTransformer.class, SwaggerUiConfigProperties.class})
@EnableConfigurationProperties(GenericConditionalVisibilityProperties.class)
@ConditionalOnProperty(
        prefix = "swagger.ui.conditional-visibility",
        name = "enabled",
        havingValue = "true",
        matchIfMissing = true)
public class GenericConditionalVisibilityAutoConfiguration {

    @Bean
    @Primary
    public SwaggerIndexTransformer genericConditionalVisibilityIndexTransformer(
            SwaggerUiConfigProperties swaggerUiConfig,
            SwaggerUiOAuthProperties swaggerUiOAuthProperties,
            SwaggerWelcomeCommon swaggerWelcomeCommon,
            ObjectMapperProvider objectMapperProvider,
            GenericConditionalVisibilityProperties properties) {
        return new GenericConditionalVisibilityIndexTransformer(
                swaggerUiConfig,
                swaggerUiOAuthProperties,
                swaggerWelcomeCommon,
                objectMapperProvider,
                properties.getPluginLocation());
    }

    @Bean
    @ConditionalOnProperty(
            prefix = "swagger.ui.conditional-visibility",
            name = "expose-static-resource",
            havingValue = "true")
    public WebMvcConfigurer genericConditionalVisibilityResourceHandler(
            GenericConditionalVisibilityProperties properties) {
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/swagger-ui-plugins/**")
                        .addResourceLocations("classpath:/" + directoryOf(properties.getPluginLocation()));
            }
        };
    }

    private static String directoryOf(String classpathFile) {
        int lastSlash = classpathFile.lastIndexOf('/');
        return lastSlash >= 0 ? classpathFile.substring(0, lastSlash + 1) : "";
    }
}
