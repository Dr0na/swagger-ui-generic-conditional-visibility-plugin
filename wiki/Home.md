# swagger-ui-generic-conditional-visibility-plugin

Welcome to the project wiki. Use this space for **roadmap**, **status**, and **documentation** alongside the [main repository](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin).

## What this project is

A **domain-neutral** [Swagger UI](https://github.com/swagger-api/swagger-ui) plugin that reads OpenAPI extensions (`x-conditional`, maps, `x-visibility`) to provide:

- Cascading **dropdowns** for path, query, and header parameters
- **Gated** request-body Example Value and Schema until all selectors are chosen
- **Resolved** body schema/example instead of a misleading `oneOf` tree

The plugin is **UI-only** — your API still validates and binds requests on the server.

## Quick links

| Topic | Wiki page |
|-------|-----------|
| Roadmap & plans | [Roadmap](Roadmap) |
| Current release & health | [Project status](Project-Status) |
| First-time setup | [Getting started](Getting-Started) |
| Try without Spring Boot | [Live demos](Live-Demos) |
| OpenAPI extensions | [OpenAPI extensions](OpenAPI-Extensions) |
| Spring Boot + springdoc | [Spring Boot integration](Spring-Boot-Integration) |
| YAML patterns | [Examples](Examples) (repo) |
| Build & debug the plugin | [Developer guide](Developer-Guide) |
| Common issues | [Troubleshooting](Troubleshooting) |

## External resources

- **Live demos (GitHub Pages):** https://dr0na.github.io/swagger-ui-generic-conditional-visibility-plugin/
- **Latest release:** https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/releases/latest
- **Extension spec (repo):** [docs/EXTENSION-CONTRACT.md](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/docs/EXTENSION-CONTRACT.md)
- **Contributing:** [CONTRIBUTING.md](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/CONTRIBUTING.md)

## License

[Apache-2.0](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/LICENSE)
