#!/usr/bin/env bash
# push.sh: stage, commit, and push Handy Pantry to GitHub.
#
# Usage (run from the repo root):
#   ./push.sh "your commit message"
#   ./push.sh                        # prompts for a message
#   ./push.sh --build "message"      # runs `pnpm build` first, aborts if it fails
#
# First time only:  chmod +x push.sh   (or run it with: bash push.sh "message")

set -euo pipefail

# ---------- helpers ----------
if [[ -t 1 ]]; then
  G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; B=$'\033[1m'; N=$'\033[0m'
else
  G=""; Y=""; R=""; B=""; N=""
fi
info() { echo "${G}==>${N} $*"; }
warn() { echo "${Y}warning:${N} $*"; }
fail() { echo "${R}error:${N} $*" >&2; exit 1; }

# ---------- args ----------
RUN_BUILD=0
if [[ "${1:-}" == "--build" ]]; then RUN_BUILD=1; shift; fi
MESSAGE="${*:-}"

# ---------- repo sanity ----------
cd "$(dirname "${BASH_SOURCE[0]}")"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "This folder isn't a git repository."

REMOTE="origin"
git remote get-url "$REMOTE" >/dev/null 2>&1 || fail "No '$REMOTE' remote found. Add one with: git remote add origin https://github.com/KeRon-asm/handy_pantry.git"

BRANCH="$(git branch --show-current)"
[[ -n "$BRANCH" ]] || fail "You're in a detached HEAD state. Switch to a branch first (e.g. git switch main)."

info "Branch: ${B}$BRANCH${N}  →  $(git remote get-url "$REMOTE")"

# ---------- catch the "works on my machine, breaks on Vercel" problem ----------
# If the code imports a package that isn't listed in package.json, the deploy will fail.
check_dep() {
  local pkg="$1" pattern="$2"
  if grep -rqE "$pattern" --include='*.ts' --include='*.tsx' app components lib 2>/dev/null; then
    if ! grep -q "\"$pkg\"" package.json; then
      fail "Your code imports '$pkg' but it isn't in package.json, so a deploy would break.
       Fix it with:  pnpm add $pkg   (then run this script again)"
    fi
  fi
}
check_dep "motion" "from ['\"]motion/react['\"]"
check_dep "geist"  "from ['\"]geist"

# package.json changed but the lockfile didn't: pnpm installs on Vercel can fail.
if git diff --name-only HEAD 2>/dev/null | grep -qx "package.json" \
   && ! git diff --name-only HEAD 2>/dev/null | grep -qx "pnpm-lock.yaml"; then
  warn "package.json changed but pnpm-lock.yaml didn't. Run 'pnpm install' if you added or removed a dependency."
fi

# ---------- optional build check ----------
if [[ $RUN_BUILD -eq 1 ]]; then
  info "Running pnpm build..."
  pnpm build || fail "Build failed. Fix the errors above, then push."
fi

# ---------- stage + safety checks ----------
git add -A

# Never commit secrets or build junk (your repo uses a Supabase service key!)
BLOCKED="$(git diff --cached --name-only \
  | grep -E '(^|/)\.env(\..*)?$|^node_modules/|^\.next/' \
  | grep -vE '\.env\.(example|sample|template)$' || true)"
if [[ -n "$BLOCKED" ]]; then
  git reset -q
  echo "$BLOCKED" | sed 's/^/  - /' >&2
  fail "Those files should never be committed (secrets / build output). Add them to .gitignore, then run this script again. Nothing was committed."
fi

# ---------- commit ----------
COMMITTED=0
if git diff --cached --quiet; then
  info "No new changes to commit."
else
  echo
  git diff --cached --stat
  echo
  if [[ -z "$MESSAGE" ]]; then
    read -r -p "Commit message (Enter for 'Update Handy Pantry'): " MESSAGE
    MESSAGE="${MESSAGE:-Update Handy Pantry}"
  fi
  git commit -q -m "$MESSAGE"
  COMMITTED=1
  info "Committed: $MESSAGE"
fi

# ---------- sync with GitHub ----------
git fetch -q "$REMOTE" "$BRANCH" 2>/dev/null || true   # fine if the branch is brand new on GitHub

if UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)"; then
  BEHIND="$(git rev-list --count HEAD..'@{u}')"
  AHEAD="$(git rev-list --count '@{u}'..HEAD)"

  if [[ "$BEHIND" -gt 0 ]]; then
    info "GitHub has $BEHIND newer commit(s). Rebasing yours on top..."
    git pull --rebase "$REMOTE" "$BRANCH" \
      || fail "Rebase hit a conflict. Fix the files git lists, run 'git add <file>' then 'git rebase --continue', then run this script again."
  fi

  if [[ "$AHEAD" -eq 0 && $COMMITTED -eq 0 ]]; then
    info "Already up to date with $UPSTREAM. Nothing to push."
    exit 0
  fi
fi

# ---------- push ----------
info "Pushing..."
if ! git push -u "$REMOTE" "$BRANCH"; then
  echo >&2
  echo "Push failed. If GitHub asked for a password: it no longer accepts account passwords." >&2
  echo "Either run 'gh auth login' (GitHub CLI) or use a Personal Access Token as the password." >&2
  exit 1
fi

echo
info "${B}Done.${N} https://github.com/KeRon-asm/handy_pantry"
info "If the repo is connected to Vercel, a new deploy should start automatically."
