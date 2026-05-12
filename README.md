# LLM YouTube Landscape Tracker

An automated, zero-cost tracker for popular YouTube channels discussing large
language models. The pipeline watches YouTube RSS feeds, extracts captions,
summarizes transcript-backed claims with GitHub Models when available, falls
back to a transcript-grounded heuristic when needed, and publishes a static site
through GitHub Pages.

The published frontend is a React prototype wired to live generated data. The
Python backend writes `site/data.js`, and the browser UI renders the searchable
table, topic heatmap, pipeline log, and transcript evidence panel.

## Quick Start

Local pipeline:

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
./scripts/refresh.sh
python -m http.server 8000 -d site
```

Open <http://localhost:8000>.

Without `GITHUB_TOKEN`, summaries fall back to a deterministic transcript-based
heuristic so the site can still be built locally. With `GITHUB_TOKEN`, the local
refresh uses GitHub Models for transcript-backed summaries.

Deploy:

```bash
git push
```

GitHub Actions deploys the committed `site/` directory to GitHub Pages.

## Refresh Workflow

The tracker refresh runs locally with `./scripts/refresh.sh` because YouTube
blocks many cloud-hosted runner IP ranges from fetching captions. The local
script runs ingestion, transcript-backed summarization, static data generation,
frontend bundling, then commits and pushes changed `data/` and `site/` files.
GitHub Actions is deploy-only: it publishes whatever is already committed in
`site/`.

Optional proxy support remains in `scripts/transcribe.py` for contributors who
already have a paid residential proxy plan, but this submission does not depend
on proxy secrets.

### Local Cron (Optional)

Refresh every 6 hours from a residential host:

```cron
0 */6 * * * cd /Users/nurkyz/Desktop/tadreamk && /bin/bash ./scripts/refresh.sh >> refresh.log 2>&1
```

## Deploy

1. Create a public GitHub repository.
2. Push this codebase.
3. In repository settings, enable GitHub Pages with GitHub Actions as the
   source.
4. Run `./scripts/refresh.sh` locally when you want fresh data.
5. Push changes; the deploy-only GitHub Actions workflow publishes `site/`.

See [REPORT.md](REPORT.md) for methodology, evaluation notes, and limitations.
