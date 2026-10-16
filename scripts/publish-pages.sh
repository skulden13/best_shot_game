#!/usr/bin/env bash
set -euo pipefail

BRANCH="${GH_PAGES_BRANCH:-gh-pages}"
REMOTE="${GH_PAGES_REMOTE:-origin}"
OUTPUT_DIR="${1:-dist}"
COMMIT_MESSAGE="${GH_PAGES_COMMIT_MESSAGE:-Update site}"

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

git check-ref-format "refs/heads/$BRANCH" >/dev/null
if [ "$BRANCH" = "$(git branch --show-current)" ]; then
  echo "Refusing to publish over the current branch: $BRANCH" >&2
  exit 1
fi

if [ ! -f "$OUTPUT_DIR/index.html" ]; then
  echo "Missing $OUTPUT_DIR/index.html. Run npm run build first." >&2
  exit 1
fi

OUTPUT_DIR="$(cd "$OUTPUT_DIR" && pwd -P)"
if [ -n "$(find "$OUTPUT_DIR" -name .git -print -quit)" ]; then
  echo "The output directory must not contain .git metadata." >&2
  exit 1
fi

# Query separately so a network failure cannot be mistaken for a new branch.
REMOTE_REF="$(git ls-remote --heads "$REMOTE" "refs/heads/$BRANCH")"
WORKTREE="$(mktemp -d)"
TEMP_BRANCH=""

cleanup() {
  git worktree remove --force "$WORKTREE" >/dev/null 2>&1 || rm -rf "$WORKTREE"
  if [ -n "$TEMP_BRANCH" ]; then
    git branch -D "$TEMP_BRANCH" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# Keep both the source checkout and any local Pages branch untouched.
if [ -n "$REMOTE_REF" ]; then
  git fetch "$REMOTE" "refs/heads/$BRANCH"
  git worktree add --detach "$WORKTREE" FETCH_HEAD
else
  git worktree add --detach "$WORKTREE" HEAD
  git -C "$WORKTREE" checkout --orphan "pages-publish-$(basename "$WORKTREE")"
  TEMP_BRANCH="pages-publish-$(basename "$WORKTREE")"
fi

find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R "$OUTPUT_DIR"/. "$WORKTREE"/
touch "$WORKTREE/.nojekyll"

git -C "$WORKTREE" add -A
if git -C "$WORKTREE" diff --cached --quiet; then
  echo "No changes to publish."
  exit 0
fi

git -C "$WORKTREE" commit -m "$COMMIT_MESSAGE"
git -C "$WORKTREE" push "$REMOTE" "HEAD:refs/heads/$BRANCH"

echo "Published $OUTPUT_DIR to $REMOTE/$BRANCH."
