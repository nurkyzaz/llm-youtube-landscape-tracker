# LLM YouTube Landscape Tracker — Report

## Problem statement

The brief asked for a public page that tracks what popular YouTube creators are actually saying about large language models — not just what they're titling their videos. Rows on the table had to be transcript-backed, the page had to live on the public internet so reviewers could open it in a browser, and the whole thing had to keep updating as new videos went up. The system also had to keep running, not just produce a one-shot snapshot.

The part I kept coming back to was the "what they actually say" requirement. A list of video titles and thumbnails would have been easier, but it wouldn't have been the assignment. Everything else in my design fell out of that constraint: I needed transcripts, I needed summaries that pulled from the transcripts, and I needed to be able to defend each row as something the creator said rather than something I inferred from a title.

## Methodology

### What I had to decide first

Before writing any code I had to settle three things: what language to use, where to host, and how to get caption data.

I chose Python. Python 3, the standard library, and a small number of well-known packages (`requests`, `youtube-transcript-api`, `yt-dlp`) covered everything I needed.

For hosting I went with GitHub Pages and GitHub Actions. The task required public, browser-accessible output, and GitHub Pages is free, deploys from a workflow, and doesn't lock me into anything I'd struggle to migrate away from later. It also has the nice property that the source code and the deployed artifact live in the same place, which makes it easy for a reviewer to follow the pipeline from a video being discovered to a row appearing on the page.

For caption data the obvious starting point was YouTube's transcript endpoint, accessed through `youtube-transcript-api`. I knew up front that this was the fragile part of the system and that I'd probably need fallbacks, so I built it that way from day one.

### Picking and resolving the channels

I started with ten English-language channels that cover LLMs from different angles — research explainers, framework vendors, tool curators, education channels, and enterprise explainers. I wanted enough range that the cross-channel comparison view (the heatmap) would actually show contrast, not just ten variations on "this week in OpenAI."

The first practical problem was that YouTube RSS feeds want a channel ID (the `UC...` string), not the friendly `@handle`. My first resolver only looked for a literal `channelId` field on the channel page and broke on several pages where YouTube nested it differently or used `browseId` or `externalId` instead. One of my initial handle guesses also returned a 404. I rewrote the resolver to try several patterns — `browseId`, `externalId`, canonical `/channel/UC...` links, and metadata channel IDs — and fall through gracefully if none matched. After that, all ten channels resolved cleanly on the first live run. Once I knew the IDs were stable I baked them into `data/channels.json` so the workflow doesn't have to re-resolve them every run.

### Watching the channels for new videos

`scripts/ingest.py` reads the channel list, pulls each RSS feed, and writes incremental state into `data/videos.json`. The merge logic was the part I spent time on: when a video that's already been summarized shows up in the feed again, I keep the previous summary fields and just refresh the metadata. Otherwise I'd lose all my work every time a video re-appeared in the rolling RSS window.

Every run also appends a small event to `data/runs.json` with counts of channels checked, videos fetched, and new videos added. That's what powers the "last updated" stamp on the site and the pipeline log view.

### Getting transcripts

`scripts/transcribe.py` was the most error-prone part to get right.

My first attempt used the older `YouTubeTranscriptApi.get_transcript(...)` static method, because that's what most examples on the internet show. The version pinned in `requirements.txt` had moved to an instance API — `YouTubeTranscriptApi().fetch(...)` — and the static call raised. I patched the script to support both versions, because I didn't want a future pin update to silently break the pipeline again.

I also added `yt-dlp` as a fallback for when the primary transcript API can't find captions but yt-dlp can. Then I hit a smaller, sneakier problem: when I installed yt-dlp with `pip install --user`, it landed in a user-local `bin` directory that wasn't on `PATH`, so `shutil.which("yt-dlp")` returned `None` even though the binary existed. I added a check for `site.USER_BASE/bin/yt-dlp` so the fallback works without me needing to fiddle with shell config.

### Turning transcripts into useful summaries

`scripts/summarize.py` produces the structured row that ends up in the table. Each summary is a JSON object with the speaker, topics, claims, tools and models mentioned, stance, evidence snippets, channel relationship, and a short 2–3 sentence summary.

I wanted the strongest possible summary to be model-generated, so the primary path calls GitHub Models (`openai/gpt-4o-mini`) with a strict-JSON prompt anchored on the transcript. GitHub Models is free for workflows when you grant the `models: read` permission, which kept the project zero-cost.

For local development I needed a fallback that didn't require any token, because I do most of my iteration on my laptop without one set. My first heuristic was honestly bad — it built a templated summary string (`"{channel} discusses {topics} in a transcript-backed video titled {title}"`), and the "tools mentioned" list was every capitalized word in the transcript, which surfaced things like "Yeah", "Basically", and "RLMs" alongside actual model names. I rewrote it as extractive sentence scoring: each sentence gets a score based on length, whether it contains a known model or tool name (from a curated allowlist), whether it uses an action verb like "released" or "announced", and how much filler it contains. The top sentences become the summary, the top three become the evidence snippets, and the model/tool list comes from regex patterns matching real names rather than capitalization. The rewrite is the difference between a row that's basically just the title re-phrased and a row that genuinely tells you what the creator said.

### Building the public site

The first version of the site was a single static HTML page with a sortable table — useful for verifying the pipeline end to end, but not the experience I wanted reviewers to land on.

I then developed a design prototype using Calude Design. Implemented it as a separate zip file: a React frontend with a heatmap view, filters, and a side panel for video evidence. I extracted those files into `site/` and rewired them to consume the real generated data instead of the prototype's synthetic data. `scripts/build_site.py` now writes `site/data.js` in the shape the frontend expects (channels, topics, models, videos, a channel-topic matrix, and pipeline log entries), so the frontend is a thin presentation layer over the actual watcher output.

The deployed page originally loaded React from a CDN and used `@babel/standalone` to transpile JSX in the browser on every visit. That was fine for prototyping but wrong for a public deployment — it loaded the development build of React and shipped about 500KB of compiler the user didn't need. I added `scripts/build_frontend.py`, which runs Babel once via Node to produce a single `site/assets/app.js`, and updated `site/index.html` to load `react.production.min.js`, `react-dom.production.min.js`, and that prebuilt bundle. The deployed site no longer ships a JIT compiler.

There was one more frontend issue I caught later: the header had a pulsing red "LIVE" badge and a counter that ticked every second, and a "Sync now" button that did nothing. The data refreshes once per cron, not continuously. I removed the fake live indicator and replaced it with a `Last updated` card pulled from `META.lastUpdated` (sourced from the most recent `runs.json` entry), plus a coloured warning row when the most recent run reports a problem. The site is now honest about its own cadence.

### Deployment and the cloud-IP problem

The first version of `.github/workflows/update-tracker.yml` ran the whole pipeline on a hosted runner — ingest, transcribe, summarize, build, deploy. The first scheduled run looked fine in the logs, but when I checked `data/runs.json` I saw three daily runs that reported `attempted: 12, completed: 0, failed: 12`. Every transcript fetch was failing.

The cause was that YouTube blocks most cloud-provider IP ranges from caption access, and GitHub-hosted runners live on Azure. `youtube-transcript-api` was getting refused, and `yt-dlp` failed for the same reason from the same IP. The pipeline was technically running on schedule, but it wasn't producing any actual summaries — the seven completed summaries on the site were ones I'd run locally and pushed by hand. So the "keeps updating" property of the system was theatre.

I added a hosted-runner guard so the system stops pretending: if `GITHUB_ACTIONS` is set and Webshare credentials aren't, the summarize step records a `proxy_configured: false` warning instead of generating twelve fake failures. The site picks that warning up through `META.warning` and shows it in orange on the header card. Even before fixing the underlying problem, the site at least stopped lying about it.

### Trying residential proxies, and finding the free tier won't help

The standard fix for this exact problem is the residential proxy product that `youtube-transcript-api` natively integrates with — Webshare. I wired the proxy config in (`WebshareProxyConfig(proxy_username=..., proxy_password=...)`), added optional `WEBSHARE_USER` / `WEBSHARE_PASS` secrets to the workflow, and signed up for a Webshare account to get credentials.

The problem is that Webshare's free tier gives you ten "Proxy Server" datacenter IPs, not residential ones. YouTube blocks datacenter IPs as aggressively as it blocks cloud-runner IPs — that's the whole reason this proxy step exists in the first place. The `WebshareProxyConfig` class is also hardcoded to route through Webshare's residential gateway, which my free-tier account didn't have access to. Paid residential plans start around a few dollars a month, but the brief was a zero-cost task and I wasn't going to spend out of pocket on it.

I kept the Webshare integration in the codebase anyway. It's gated on env vars, falls back cleanly when they're missing, and is covered by a unit test that mocks the library and asserts the credentials reach the constructor. If anyone with paid residential proxies forks this repo, the path is one secret-set away from working. But the submission doesn't depend on it.

### Switching to a laptop-as-runner architecture

Once I accepted that no fully-free hosted path existed, the obvious move was to run the heavy step from my own machine. My CUHK residential connection isn't blocked by YouTube — the seven summaries I'd produced locally were proof — so the cheapest residential IP I had access to was the one I was already sitting in front of.

The architecture I landed on is: the pipeline runs locally via `./scripts/refresh.sh`, which activates the venv (gracefully skipping if it isn't there), runs ingest, summarize, build_site, and build_frontend in order, stages `data/` and `site/`, and pushes if there are changes. GitHub Actions does deploy only — checkout, configure Pages, upload `site/`, deploy. I stripped out the Python setup, the proxy secrets, and the pipeline steps. The workflow no longer needs `contents: write` or `models: read`; only `pages: write` and `id-token: write`. A small unit test asserts the workflow file doesn't contain `scripts.ingest`, `scripts.summarize`, or `WEBSHARE_USER`, so a future regression that re-introduces the broken hosted refresh would fail tests.

A local cron is documented in the README — running the script every six hours satisfies the "keeps updating" requirement from a residential IP without me having to remember. The site itself doesn't change behaviour; from a reviewer's perspective it just keeps getting fresher data.

### Resetting old summaries so the new pipeline could replace them

When I improved the heuristic, the seven summaries that already had `summary_status: complete` were left alone — the loop skipped them. So the new heuristic existed in code but not in the published data, and the `MODELS` dropdown on the site was still showing the old regex-grabbed junk like "RLMs", "Yeah", "Vibe", and "Seriously".

I wrote `scripts/reset_stale.py` to flip status back to `pending` for any video whose summary was produced by `local-heuristic`. When I actually ran it after the architectural refactor, it reset zero rows — by that point the GitHub Models path had already taken over those entries on the next refresh and there were no stale heuristic rows left. I kept the script in the repo anyway because it's the right tool to have around: if the heuristic ever changes again, or if a future contributor wants to force regeneration, running it is a one-liner.

## Evaluation dataset

The tracker watches ten LLM-related YouTube channels, deliberately chosen to span different parts of the landscape:

- Matt Wolfe — tool and news curator, broad coverage of new AI tools
- Two Minute Papers — research explainer with a long history of paper summaries
- Yannic Kilcher — research and model analysis, often skeptical and technical
- Andrej Karpathy — first-principles LLM education from someone who built them
- AI Explained — frontier-model benchmark and capability analysis
- The AI Advantage — applied workflows, agents, productivity tooling
- IBM Technology — enterprise and conceptual explainers
- LangChain — framework vendor, agent and RAG content
- AssemblyAI — developer platform, speech-AI and multimodal apps
- DeepLearning.AI — education and industry interviews

The point of this mix is that "LLM YouTube" isn't one community — it's at least four (researchers, framework vendors, educators, applied-tooling channels), and the cross-channel relationship view on the site is more useful when those four are visibly distinct.

## Evaluation methods

I checked five things to convince myself the system actually works.

First, RSS coverage: all ten channels resolve to an ID and produce parseable feeds on every run. Second, transcript coverage: I counted how many of the ingested videos produced usable captions through either path (`youtube-transcript-api` first, `yt-dlp` fallback). Third, schema validity: every produced summary is run through `validate_summary`, which enforces required fields, list types, and length caps. The unit tests assert this for both the model-generated and the heuristic paths. Fourth, site rendering: I open the deployed page and confirm that the table, filters, heatmap, and evidence panel are all populated from the real `data.js` — and that the model/tool dropdown contains real names (GPT, Claude, LangGraph, Gemini) rather than capitalized junk. Fifth, automation health: I check `runs.json` after each refresh and confirm the deploy-only GitHub Actions workflow finishes green.

## Experimental results

After the final refactor:

- 10 channels are tracked, all resolving cleanly.
- 50 recent videos have been ingested across all channels.
- 15 videos have transcript-backed summaries generated by `openai/gpt-4o-mini` through GitHub Models.
- 0 videos remain on the old `local-heuristic` provider — every completed summary on the live site is now model-generated.
- The most recent local refresh produced a `data.js` with `lastUpdated: 2026-05-12T03:04:39+00:00`.
- The deploy-only GitHub Actions run (`25710763233`) completed successfully and published the site.
- 8 unit tests pass locally.

The table on the deployed site now shows, for each row: who is speaking (or the channel if no specific speaker is inferable), which LLM topics the video covers, the tools and models mentioned, a stance label, a 2–3 sentence transcript-backed summary, supporting claim snippets, and a link back to the source video on YouTube. The heatmap view shows which channels are emphasising which topics — IBM Technology clusters on RAG and enterprise, LangChain clusters on agents, Two Minute Papers clusters on research papers, and so on. That's the cross-channel relationship view the brief asked for.

## Limitations

- Not every newly-ingested video has captions immediately available; those rows stay in `pending` state and are retried on the next refresh.
- YouTube can rate-limit or block transcript extraction from any IP it considers suspicious. Residential connections are far more reliable than cloud IPs but not bulletproof.
- A fully-automated hosted refresh would require either paid residential proxies or a self-hosted runner on a residential network. Both were out of scope for a zero-cost submission, so refresh runs from my laptop instead.
- GitHub Models can be rate-limited or temporarily unavailable depending on repository access and account quota; in that case the pipeline falls back to the local heuristic for that single run.
- Speaker and guest detection is best-effort from transcript content — it works reliably for solo channels but can miss guest names in interview-style videos.
- The site does not publish full transcripts. It publishes summaries, short evidence snippets, status metadata, and source links. This is intentional — I don't want to redistribute the underlying YouTube content.

## Public output

- Repository: <https://github.com/nurkyzaz/llm-youtube-landscape-tracker>
- Live site: <https://nurkyzaz.github.io/llm-youtube-landscape-tracker/>
- This report: <https://github.com/nurkyzaz/llm-youtube-landscape-tracker/blob/main/REPORT.md>
