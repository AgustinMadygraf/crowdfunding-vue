#!/usr/bin/env bash
set -euo pipefail

echo "[arch-boundaries] Checking forbidden imports..."

violations=0

check_rule() {
  local description="$1"
  local pattern="$2"
  local path="$3"

  local matches
  matches="$(rg -n "$pattern" "$path" || true)"

  if [[ -n "$matches" ]]; then
    echo "[arch-boundaries] FAIL: ${description}"
    echo "$matches"
    violations=1
  else
    echo "[arch-boundaries] OK: ${description}"
  fi
}

check_rule "src/domain must not import infrastructure" "^import .*@/infrastructure/" "src/domain"
check_rule "src/domain must not import vue" "^import .*from ['\"]vue['\"]" "src/domain"
check_rule "src/application must not import infrastructure" "^import .*@/infrastructure/" "src/application"
check_rule "src/application must not import vue" "^import .*from ['\"]vue['\"]" "src/application"

if [[ "$violations" -ne 0 ]]; then
  echo "[arch-boundaries] Boundary violations detected."
  exit 1
fi

echo "[arch-boundaries] All checks passed."
