# GitHub Pages

Live demos are deployed by [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) on every push to `main`.

**URL:** https://dr0na.github.io/swagger-ui-generic-conditional-visibility-plugin/

## One-time enable (repo admin)

1. Open **Settings → Pages** for this repository.
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Re-run the latest **Deploy GitHub Pages** workflow (Actions tab → workflow → **Re-run all jobs**).

The first deploy fails with `Failed to create deployment (status: 404)` until Pages is enabled in settings.

## Local preview

```bash
npm run pages:prepare
npx --yes http-server site -p 9080
```

Open http://localhost:9080/ (hub at site root, same layout as Pages).
