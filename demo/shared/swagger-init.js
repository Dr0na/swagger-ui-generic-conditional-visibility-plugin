/**
 * Initialize Swagger UI with the generic conditional visibility plugin.
 * @param {string} specUrl - OpenAPI document URL (relative to demo page)
 */
function initConditionalVisibilityDemo(specUrl) {
  window.ui = SwaggerUIBundle({
    url: specUrl,
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl,
      function () {
        return SwaggerUIGenericConditionalVisibilityPlugin();
      },
    ],
    layout: "BaseLayout",
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    docExpansion: "list",
    tryItOutEnabled: false,
  });
}
