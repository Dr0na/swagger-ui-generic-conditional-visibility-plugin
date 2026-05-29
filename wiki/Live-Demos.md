# Live demos

Try the plugin in your browser — **no Spring Boot**, no backend, no install required for the online demos.

## Try online (recommended)

**Demo hub:** https://dr0na.github.io/swagger-ui-generic-conditional-visibility-plugin/

| Demo | Link | What you will see |
|------|------|-------------------|
| **Catalog** (2 path selectors) | [Open catalog demo](https://dr0na.github.io/swagger-ui-generic-conditional-visibility-plugin/catalog/) | `region` + `tier` — request body stays hidden until both are chosen |
| **Deployments** (3 selectors) | [Open deployments demo](https://dr0na.github.io/swagger-ui-generic-conditional-visibility-plugin/deployments/) | Path + path + `X-Channel` header — three-step cascade |

### What to do in each demo

1. Expand the **POST** operation.
2. Use the **dropdowns** for parameters (not plain text fields).
3. Notice the **request body** shows a short gate message until every selector has a value.
4. Pick the first selector — downstream selectors and the body update; the body may still be gated.
5. Complete **all** selectors — **Example Value** and **Schema** should show **one** DTO, not a full `oneOf` list.
6. Change an earlier selector — later choices and the body **reset**.

If a demo page does not load, use the [local setup](#run-locally) below or report an [issue](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/issues/new?template=bug_report.yml).

## Run locally

For contributors or offline use:

```bash
git clone https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin.git
cd swagger-ui-generic-conditional-visibility-plugin
npm ci && npm run demo
```

Open http://localhost:9080/demo/ and choose **Catalog** or **Deployments**.

Requires **Node.js 20+**.

## Screenshots

Walkthrough images are in the repository [README](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin#live-demos-no-backend) and [docs/DEMOS.md](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/blob/main/docs/DEMOS.md).

## Next steps

- New to the extensions? → [[Getting-Started]]
- Integrating with Java? → [[Spring-Boot-Integration]]
- Something wrong? → [[Troubleshooting]]
