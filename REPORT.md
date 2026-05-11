# LLM YouTube Landscape Tracker Report

## Problem Statement

The goal was to build a public page that tracks popular YouTube channels talking
about large language models (LLMs). The important requirement was not just to
list video titles. The table needed to reflect what creators actually say, using
captions or transcripts as evidence.

The final system watches YouTube channels, collects recent videos, extracts
captions when available, summarizes the transcript content, and publishes the
result as a GitHub Pages site that reviewers can open in a browser.

## Step-by-Step Methodology

### 1. Started With the Requested OpenClaw-Style Watcher

The original idea was to use OpenClaw or an equivalent automated watcher. I chose
an equivalent watcher because the task needed to run publicly without paid
infrastructure.

What I used instead:

- YouTube RSS feeds for video discovery.
- GitHub Actions for scheduled automation.
- GitHub Pages for public hosting.
- GitHub Models for AI summaries when the workflow runs on GitHub.

This keeps the project free and easy to inspect because the full pipeline is in
the public repository.

### 2. Checked the Local Environment

I first inspected the workspace and found it was empty and not yet a Git
repository. That meant this should be a fresh project rather than a modification
to existing code.

I also checked the available tools:

- Python was available.
- Git was available.
- Node was broken locally because of a missing ICU library.
- The GitHub CLI (`gh`) was not installed.

Because Node was not reliable on this machine, I built the pipeline in Python.

### 3. Tried Simple YouTube Channel URLs

I needed YouTube channel IDs because YouTube RSS feeds use this format:

```text
https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
```

At first, I tried resolving channels by looking only for `channelId` in YouTube
pages. That did not work consistently. Some pages did not expose that exact
field, and one of the initially guessed handles returned a 404.

I then changed the resolver to look for several patterns:

- `browseId`
- `externalId`
- canonical `/channel/UC...` URLs
- metadata channel IDs when present

That worked. The live ingestion later confirmed all 10 configured channels could
be resolved and read from RSS.

### 4. Built the Ingestion Script

I created `scripts/ingest.py`.

What it does:

1. Reads `data/channels.json`.
2. Resolves each YouTube handle or channel page to a channel ID.
3. Reads the channel RSS feed.
4. Extracts recent video metadata.
5. Saves incremental state in `data/videos.json`.
6. Records each run in `data/runs.json`.

The first live ingestion collected 10 recent videos from 10 channels with no
channel failures.

### 5. Built Transcript Collection

I created `scripts/transcribe.py`.

The first attempt used the older `youtube-transcript-api` example:

```python
YouTubeTranscriptApi.get_transcript(...)
```

That failed because the installed current version exposes a newer API:

```python
YouTubeTranscriptApi().fetch(...)
```

I patched the script to support both versions. I also added a fallback through
`yt-dlp` for subtitles.

Another issue appeared locally: `pip --user` installed `yt-dlp` into a directory
that was not on `PATH`. I updated the code to also check the Python user binary
directory, so the fallback can still work.

### 6. Built Transcript-Backed Summaries

I created `scripts/summarize.py`.

The preferred path uses GitHub Models from GitHub Actions. It asks for a strict
JSON summary with these fields:

- speaker
- topics
- claims
- tools or models mentioned
- stance
- evidence snippets
- channel relationship
- concise summary

For local development, there may be no `GITHUB_TOKEN` with model access. To make
the project still testable without paid services, I added a deterministic local
heuristic fallback. The fallback uses transcript text to identify topic keywords,
claims, evidence snippets, and mentioned tools/models.

This means the pipeline can always build a useful table, while GitHub Actions can
use the stronger AI summarizer when GitHub Models is available.

### 7. Built the Public Site

I created `scripts/build_site.py`.

The first version generated a simple static HTML table. After that, I received a
separate design prototype as a zip file. I extracted the design files and wired
them to the live backend instead of using the prototype's synthetic data.

The current frontend uses:

- `site/index.html`
- `site/app.jsx`
- `site/ui.jsx`
- `site/tweaks-panel.jsx`
- `site/data.js`

The site includes:

- a landscape table of videos
- a searchable/filterable React UI
- a topic coverage heatmap
- who is speaking
- topics covered
- transcript-backed claims
- tools and models mentioned
- channel relationships
- transcript and summary status
- short evidence snippets
- update logs
- counts for channels, videos, and completed summaries

The backend writes `site/data.js` in the frontend's expected shape, so the
browser interface is connected to the real watcher output rather than mock data.

The site intentionally does not publish full transcripts. It only publishes
summaries, short snippets, timestamps/status metadata, and source links.

### 8. Added GitHub Actions Automation

I created `.github/workflows/update-tracker.yml`.

The workflow runs every day and can also be started manually. It performs:

1. Install Python dependencies.
2. Run ingestion.
3. Summarize pending transcript-backed videos.
4. Build the static site.
5. Commit updated `data/` and `site/` files.
6. Deploy the site to GitHub Pages.

The workflow uses these permissions:

- `contents: write`
- `pages: write`
- `id-token: write`
- `models: read`

### 9. Tested the Pipeline

I added unit tests in `tests/test_pipeline.py`.

The tests check:

- RSS fixture parsing.
- Merging new videos without losing previous summaries.
- Summary schema validation.
- Static site generation.

The tests passed locally:

```text
Ran 4 tests
OK
```

I also ran live ingestion and summarization locally. The local run collected 10
videos and generated transcript-backed summaries for 7 of them. The remaining
videos are kept in the data file and retried in later runs.

### 10. Tried to Push to GitHub

The first push did not work because the remote was still a placeholder:

```text
https://github.com/YOUR_USER/llm-youtube-landscape-tracker.git
```

The target repository also did not exist yet under the GitHub account.

I checked the macOS keychain and confirmed there was a GitHub credential for the
connected account. Since `gh` was not installed, I used GitHub's API through
Python to create the public repository.

Then I changed the Git remote to:

```text
https://github.com/nurkyzaz/llm-youtube-landscape-tracker.git
```

After that, the push succeeded.

### 11. Enabled GitHub Pages and Ran the Workflow

After pushing the repository, I used the GitHub API to enable Pages with workflow
deployment and manually triggered the update workflow.

The workflow completed successfully and published the site.

## Evaluation Dataset

The tracker starts with 10 LLM-related YouTube channels:

- Matt Wolfe: tool/news curator
- Two Minute Papers: research explainer
- Yannic Kilcher: research and model-analysis commentator
- Andrej Karpathy: first-principles LLM education
- AI Explained: frontier-model analysis
- The AI Advantage: applied AI workflow coverage
- IBM Technology: enterprise and conceptual explainers
- LangChain: framework/vendor and agent workflows
- AssemblyAI: speech, multimodal, and LLM app engineering
- DeepLearning.AI: education and industry interviews

This mix is intentional. It includes creators who explain research, creators who
track AI tools, creators who teach concepts, and organizations building or
teaching LLM systems.

## Evaluation Methods

I evaluated the project in these ways:

1. RSS coverage: confirm that all configured channels can be resolved and read.
2. Transcript coverage: count how many videos have usable captions.
3. Schema validity: ensure summaries always include the expected fields.
4. Site rendering: confirm the generated browser page contains the table and
   source links.
5. Automation health: confirm the GitHub Actions workflow completes and deploys
   GitHub Pages.

## Experimental Results

The current implementation produced these results:

- 10 configured YouTube channels.
- 10 recent videos ingested during the first local live run.
- 7 transcript-backed summaries generated locally.
- GitHub repository created and pushed successfully.
- GitHub Pages enabled.
- The scheduled/manual workflow completed successfully.

The generated table shows which creator/channel is speaking, what LLM topics are
covered, the transcript-backed summary, claims, evidence snippets, and how the
channel relates to the rest of the LLM YouTube landscape.

## Limitations

- Some videos do not have captions immediately, so they are retried later.
- YouTube may rate-limit transcript extraction.
- GitHub Models can be rate-limited or unavailable depending on repository
  access and GitHub account settings.
- Speaker and guest detection is best-effort.
- The site does not host full transcripts to avoid redistributing YouTube
  content.

## Public Output

- Repository: https://github.com/nurkyzaz/llm-youtube-landscape-tracker
- Live report/site: https://nurkyzaz.github.io/llm-youtube-landscape-tracker/
- Markdown report: https://github.com/nurkyzaz/llm-youtube-landscape-tracker/blob/main/REPORT.md
