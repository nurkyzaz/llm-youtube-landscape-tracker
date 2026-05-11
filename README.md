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

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python -m scripts.ingest --limit-per-channel 3
python -m scripts.summarize --max-videos 10
python -m scripts.build_site
python -m scripts.build_frontend
python -m http.server 8000 -d site
```

Open <http://localhost:8000>.

Without `GITHUB_TOKEN`, summaries fall back to a deterministic transcript-based
heuristic so the site can still be built locally. In GitHub Actions, the
workflow uses the repository token with `models: read` permissions.

## Production Refresh Requirements

GitHub-hosted runners often cannot fetch YouTube captions directly because
YouTube blocks many cloud-provider IP ranges. For the scheduled tracker to keep
summaries current, add these repository secrets:

- `WEBSHARE_USER`
- `WEBSHARE_PASS`

The transcript client uses `youtube-transcript-api` with Webshare's native proxy
configuration when those secrets are present. If they are missing, the site still
builds, but the pipeline log and page metadata warn that hosted caption fetches
may fail.

## Deploy

1. Create a public GitHub repository.
2. Push this codebase.
3. In repository settings, enable GitHub Pages with GitHub Actions as the
   source.
4. Add `WEBSHARE_USER` and `WEBSHARE_PASS` repository secrets.
5. Run the `Update tracker and publish site` workflow manually or wait for the
   daily schedule.

See [REPORT.md](REPORT.md) for methodology, evaluation notes, and limitations.
