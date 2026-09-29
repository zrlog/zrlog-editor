#!/bin/sh
set -eu
cd "$(dirname "$0")/.."

if [ "$#" -ne 1 ]; then
  echo "Usage: sh shell/version.sh <version> (for example: 2.1.34 or 34)" >&2
  exit 1
fi

# Keep the old patch-number shorthand for local release preparation.
case "$1" in
  *[!0-9]*|'') releaseVersion="$1" ;;
  *) releaseVersion="2.1.$1" ;;
esac

npm version "$releaseVersion" --no-git-tag-version
npm test
npm run pack
echo "Review and commit the changes, then run the Publish editor package workflow."
