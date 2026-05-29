#!/usr/bin/env bash
# Publish wiki/*.md to GitHub Wiki (separate git repo).
# Prerequisites:
#   1. Wiki enabled: repo Settings → General → Features → Wikis
#   2. SSH: git@github-Dr0na:Dr0na/swagger-ui-generic-conditional-visibility-plugin.wiki.git
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WIKI_REMOTE="${WIKI_REMOTE:-git@github-Dr0na:Dr0na/swagger-ui-generic-conditional-visibility-plugin.wiki.git}"
WORKDIR="${TMPDIR:-/tmp}/gcv-wiki-push-$$"

rm -rf "$WORKDIR"
if git clone "$WIKI_REMOTE" "$WORKDIR" 2>/dev/null; then
  echo "Cloned existing wiki."
else
  echo ""
  echo "ERROR: Wiki git repository does not exist yet."
  echo ""
  echo "GitHub only creates *.wiki.git after the FIRST page is saved in the browser:"
  echo "  https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/wiki"
  echo "  → Click 'Create the first page' → Title: Home → Save"
  echo ""
  echo "Then run: npm run wiki:push"
  echo ""
  echo "See docs/WIKI.md for full instructions."
  exit 1
fi

cp "$ROOT"/wiki/*.md "$WORKDIR"/
cd "$WORKDIR"
git add -A
if git diff --staged --quiet; then
  echo "Wiki already up to date."
  exit 0
fi

git -C "$WORKDIR" config user.name "${WIKI_USER_NAME:-Dr0na}"
git -C "$WORKDIR" config user.email "${WIKI_USER_EMAIL:-4620328+Dr0na@users.noreply.github.com}"
git commit -m "Sync wiki from main repository"
# GitHub Wiki uses branch "master", not "main"
WIKI_BRANCH=$(git branch --show-current)
echo "Pushing to wiki branch: ${WIKI_BRANCH}"
git push -u origin "HEAD:${WIKI_BRANCH}"
echo "Wiki published: https://github.com/Dr0na/swagger-ui-generic-conditional-visibility-plugin/wiki"
