# LLM YouTube Landscape Tracker

An automated, zero-cost tracker for popular YouTube channels discussing large
language models. The pipeline watches YouTube RSS feeds, extracts captions,
summarizes transcript-backed claims with GitHub Models, and publishes a static
site through GitHub Pages.

The published frontend is a React prototype wired to live generated data. The
Python backend writes `site/data.js`, and the browser UI renders the searchable
table, topic heatmap, channel relationship graph, and transcript evidence panel.

## Quick Start

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python -m scripts.ingest --limit-per-channel 3
python -m scripts.summarize --max-videos 10
python -m scripts.build_site
python -m http.server 8000 -d site
```

Open <http://localhost:8000>.

Without `GITHUB_TOKEN`, summaries fall back to a deterministic transcript-based
heuristic so the site can still be built locally. In GitHub Actions, the
workflow uses the repository token with `models: read` permissions.

## Deploy

1. Create a public GitHub repository.
2. Push this codebase.
3. In repository settings, enable GitHub Pages with GitHub Actions as the
   source.
4. Run the `Update tracker and publish site` workflow manually or wait for the
   daily schedule.

See [REPORT.md](REPORT.md) for methodology, evaluation notes, and limitations.
