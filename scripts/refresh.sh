#!/usr/bin/env bash
# Local refresh entrypoint. Run this from a residential IP; GitHub Actions only deploys the generated site.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -f .venv/bin/activate ]; then
  source .venv/bin/activate
fi
python -m scripts.ingest --limit-per-channel 5
python -m scripts.summarize --max-videos 12
python -m scripts.build_site
python -m scripts.build_frontend
git add data site
if ! git diff --cached --quiet; then
  git commit -m "Refresh tracker $(date -u +%FT%TZ)"
  git push
else
  echo "No changes to commit."
fi
