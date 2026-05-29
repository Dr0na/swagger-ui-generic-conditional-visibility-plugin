# Security policy

## Supported versions

Security fixes are provided for the latest release on the `main` branch and the most recent tagged release.

| Version | Supported |
|---------|-----------|
| Latest `main` | Yes |
| Latest release tag | Yes |
| Older tags | No |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

1. Open a [private security advisory](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/security/advisories/new) on this repository, or
2. Contact the maintainers through GitHub if advisory access is unavailable.

Include:

- A description of the issue and potential impact
- Steps to reproduce (Swagger UI version, browser, minimal OpenAPI snippet if relevant)
- Whether the issue is in the plugin script, demo pages, or Spring Boot starter

## What to expect

- Acknowledgement within **5 business days**
- An initial assessment and planned fix or mitigation timeline
- A coordinated disclosure once a fix is available (credit given unless you prefer anonymity)

## Scope

In scope:

- `src/plugin.js` and released `dist/generic-conditional-visibility-plugin.js`
- `spring-boot-starter/` auto-configuration and index transformer
- Official demo and documentation assets in this repository

Out of scope:

- Vulnerabilities in [Swagger UI](https://github.com/swagger-api/swagger-ui) or [springdoc-openapi](https://github.com/springdoc/springdoc-openapi) themselves (report to those projects)
- Consumer applications that embed the plugin with unsafe CSP, untrusted OpenAPI specs, or custom script injection

## Safe usage notes

- Treat OpenAPI documents as **untrusted input** only when they come from untrusted sources; the plugin evaluates extension metadata in the browser.
- Pin plugin versions in production (release assets or a copied bundle with a known hash).
