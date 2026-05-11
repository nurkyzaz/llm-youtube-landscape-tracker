# LLM YouTube Landscape Tracker Report

## Problem Statement

Reviewers need a public, continuously updated view of what popular YouTube
creators are actually saying about large language models. Titles and thumbnails
are too thin for this job, so the tracker uses captions or transcripts as the
primary evidence source.

## Methodology

The project uses a free GitHub-native stack. A scheduled GitHub Actions workflow
reads a curated list of LLM-related YouTube channels, resolves channel handles
to RSS feeds, ingests new videos, extracts captions, asks GitHub Models for a
structured summary, and publishes a static site to GitHub Pages.

The watcher is equivalent to an OpenClaw-style source monitor, but implemented
with YouTube RSS and GitHub Actions so it is auditable, portable, and free. The
site exposes the collection process, update history, per-video provenance, and
the categorised table used for review.

No full transcripts are published. The output stores compact summaries, topic
tags, brief evidence snippets, timestamps, and links back to YouTube.

## Evaluation Dataset

The seed set covers a mix of LLM perspectives:

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

Each run records the number of known videos, transcript-backed videos, and
videos still waiting for captions.

## Evaluation Methods

- Transcript coverage: percentage of videos with usable captions.
- Schema validity: every summary must conform to the expected JSON fields.
- Provenance checks: every table row links to the source video and records the
  transcript provider/status.
- Freshness: update logs show the latest workflow run and new videos detected.
- Spot checks: reviewers can compare evidence snippets with the source video.

## Experimental Results

The first live run will populate `data/videos.json`, `data/runs.json`, and the
published site. Expected initial behavior:

- RSS ingestion should work for channels whose public YouTube page resolves to a
  channel ID.
- Caption extraction should succeed for many recent public videos, especially
  channels that publish manual or auto-generated English captions.
- Videos without captions are marked `transcript_unavailable` and retried on
  later runs.
- If GitHub Models is temporarily rate-limited, the pipeline keeps the row and
  records the summarization error instead of dropping the video.

## Limitations

- YouTube captions are not guaranteed for every video and can appear after
  publication.
- YouTube may rate-limit transcript extraction. The workflow processes a bounded
  number of new videos per run.
- GitHub Models is rate-limited and may change while in preview.
- Speaker and guest inference is best-effort from channel metadata, titles, and
  transcript text.
- The site intentionally avoids publishing full transcripts.
