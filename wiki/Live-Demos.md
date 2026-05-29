# Live demos

Try the plugin **without** Spring Boot or a backend API.

## Online

**https://dr0na.github.io/swagger-ui-generic-conditional-visibility-plugin/**

If you see 404, enable Pages once: [Settings → Pages](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/settings/pages) → source **GitHub Actions**, then re-run the **Deploy GitHub Pages** workflow.

## Scenarios

| Demo | Selectors | What to try |
|------|-----------|-------------|
| **Catalog** | `region`, `tier` (path) | Body hidden until both set; example/schema match one DTO |
| **Deployments** | `region`, `tier` (path), `X-Channel` (header) | Three-step cascade; mixed `in` types |

## Local

```bash
git clone https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin.git
cd swagger-ui-generic-conditional-visibility-plugin
npm ci && npm run demo
```

Open http://localhost:9080/demo/

## Screenshots

See the [README](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin#live-demos-no-backend) or [docs/DEMOS.md](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/docs/DEMOS.md).

Regenerate: `npm run screenshots` (requires Playwright).
