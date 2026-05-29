# GitHub Wiki

Wiki source files live in [`wiki/`](../wiki/). Published site:

**https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/wiki**

## Why the wiki looks empty

GitHub enables **Wikis** in settings (`has_wiki: true`) but does **not** create the hidden `*.wiki.git` repository until someone saves the **first page in the browser**. Until then, `git push` and CI sync fail with `Repository not found`.

## One-time bootstrap (required)

Do this once as a repo admin (logged in as **Dr0na**):

### Step 1 — Create the first page in the browser

1. Open **https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/wiki**
2. Click **Create the first page** (or **New Page**).
3. **Title:** `Home`
4. **Content:** paste the contents of [`wiki/Home.md`](../wiki/Home.md) from this repo (or a single line: `Documentation index — syncing full wiki next.`).
5. Click **Save Page**.

### Step 2 — Publish all wiki pages

From your machine (Dr0na SSH / `github-Dr0na` remote):

```bash
cd swagger-ui-generic-conditional-visibility-plugin
npm run wiki:push
```

Or re-run the **Sync Wiki** GitHub Action: **Actions → Sync Wiki → Run workflow**.

You should then see all pages (Roadmap, Project status, Getting started, etc.) in the wiki sidebar.

## Ongoing updates

| Method | When |
|--------|------|
| Edit `wiki/*.md` on `main` | **Sync Wiki** workflow runs automatically |
| `npm run wiki:push` | Manual publish after local edits |

## Wiki pages

| Page | File |
|------|------|
| Home | `wiki/Home.md` |
| Roadmap | `wiki/Roadmap.md` |
| Project status | `wiki/Project-Status.md` |
| Getting started | `wiki/Getting-Started.md` |
| Live demos | `wiki/Live-Demos.md` |
| OpenAPI extensions | `wiki/OpenAPI-Extensions.md` |
| Spring Boot integration | `wiki/Spring-Boot-Integration.md` |
| Developer guide | `wiki/Developer-Guide.md` |
| Troubleshooting | `wiki/Troubleshooting.md` |
| Sidebar | `wiki/_Sidebar.md` |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Wiki tab missing | **Settings → General → Features → Wikis** ✓ |
| `Repository not found` on push | Complete **Step 1** above first |
| `src refspec main does not match any` | Wiki uses branch **`master`** — use latest `wiki-sync` workflow / `push-wiki.sh` (pushes current branch) |
| Push denied to `vnalwar` | Use `git@github-Dr0na:...wiki.git` (see repo `.git/config` for main) |
| Sync Wiki workflow fails | Bootstrap in browser, then re-run workflow |
