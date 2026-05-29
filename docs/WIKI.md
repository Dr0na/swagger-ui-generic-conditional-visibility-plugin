# GitHub Wiki

Wiki content is maintained in [`wiki/`](../wiki/) on the `main` branch and published to:

**https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/wiki**

## One-time setup (repo admin)

1. Open [Settings → General → Features](https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/settings)
2. Enable **Wikis**
3. Either:
   - Push manually: `npm run wiki:push` (uses `git@github-Dr0na:...wiki.git`), or
   - Run the **Sync Wiki** workflow (Actions → Sync Wiki → Run workflow)

The [wiki-sync workflow](../.github/workflows/wiki-sync.yml) also runs automatically when files under `wiki/` change on `main`.

## Pages

| Wiki page | Purpose |
|-----------|---------|
| Home | Overview and index |
| Roadmap | Plans and shipped features |
| Project status | Release and compatibility |
| Getting started | Quick integration paths |
| Live demos | GitHub Pages and local demos |
| OpenAPI extensions | Extension summary |
| Spring Boot integration | springdoc + starter |
| Developer guide | Build and architecture |
| Troubleshooting | Common fixes |

## Edit workflow

1. Change markdown under `wiki/`
2. Commit to `main` (CI syncs wiki) or run `npm run wiki:push` locally
