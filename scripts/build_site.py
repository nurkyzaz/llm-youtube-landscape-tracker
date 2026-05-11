from __future__ import annotations

import argparse
import html
from collections import Counter
from typing import Any

from .common import CHANNELS_PATH, RUNS_PATH, SITE_DIR, VIDEOS_PATH, now_iso, read_json


def esc(value: Any) -> str:
    return html.escape(str(value or ""))


def pill_list(items: list[str]) -> str:
    return "".join(f"<span class='pill'>{esc(item)}</span>" for item in items[:6])


def video_row(video: dict[str, Any]) -> str:
    summary = video.get("summary") or {}
    topics = summary.get("topics") or video.get("channel_focus") or []
    claims = summary.get("claims") or []
    evidence = summary.get("evidence_snippets") or []
    tools = summary.get("tools_models_mentioned") or []
    status = video.get("summary_status", "pending")
    return f"""
    <tr>
      <td>
        <a href="{esc(video.get('url'))}">{esc(video.get('title'))}</a>
        <div class="meta">{esc(video.get('published_at'))}</div>
      </td>
      <td>{esc(video.get('channel'))}<div class="meta">{esc(summary.get('speaker') or video.get('author'))}</div></td>
      <td>{pill_list(topics)}</td>
      <td>{esc(summary.get('summary') or video.get('summary_error') or 'Waiting for transcript and summary.')}</td>
      <td><ul>{"".join(f"<li>{esc(claim)}</li>" for claim in claims[:3])}</ul></td>
      <td>{pill_list(tools)}</td>
      <td>{esc(video.get('relationship'))}<div class="meta">{esc(summary.get('channel_relationship'))}</div></td>
      <td><span class="status {esc(status)}">{esc(status)}</span><div class="meta">{esc(video.get('transcript_status'))} via {esc(video.get('transcript_provider', 'n/a'))}</div></td>
      <td><ul>{"".join(f"<li>{esc(item)}</li>" for item in evidence[:2])}</ul></td>
    </tr>
    """


def build_site() -> None:
    SITE_DIR.mkdir(parents=True, exist_ok=True)
    channels = read_json(CHANNELS_PATH, [])
    videos = read_json(VIDEOS_PATH, [])
    runs = read_json(RUNS_PATH, [])
    completed = [video for video in videos if video.get("summary_status") == "complete"]
    topic_counts = Counter(topic for video in completed for topic in (video.get("summary") or {}).get("topics", []))
    relationship_counts = Counter(channel.get("relationship", "unknown") for channel in channels)
    latest_run = runs[-1] if runs else {}

    html_doc = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>LLM YouTube Landscape Tracker</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>LLM YouTube Landscape Tracker</h1>
    <p>Transcript-backed monitoring of popular YouTube channels covering large language models.</p>
    <div class="stats">
      <span><strong>{len(channels)}</strong> channels watched</span>
      <span><strong>{len(videos)}</strong> videos known</span>
      <span><strong>{len(completed)}</strong> transcript-backed summaries</span>
      <span><strong>{esc(latest_run.get('timestamp', 'not run yet'))}</strong> latest update</span>
    </div>
  </header>
  <main>
    <section>
      <h2>Landscape Table</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Video</th>
              <th>Who is speaking</th>
              <th>Topics</th>
              <th>Summary</th>
              <th>Transcript-backed claims</th>
              <th>Tools/models</th>
              <th>Channel relationship</th>
              <th>Status</th>
              <th>Evidence snippets</th>
            </tr>
          </thead>
          <tbody>
            {"".join(video_row(video) for video in videos)}
          </tbody>
        </table>
      </div>
    </section>
    <section class="grid">
      <div>
        <h2>How Data Is Collected</h2>
        <ol>
          <li>Resolve each YouTube handle to a channel ID.</li>
          <li>Read the public YouTube RSS feed for recent videos.</li>
          <li>Fetch English captions with youtube-transcript-api, then yt-dlp fallback.</li>
          <li>Summarize transcript excerpts into a fixed JSON schema with GitHub Models.</li>
          <li>Regenerate this static site and deploy with GitHub Pages.</li>
        </ol>
      </div>
      <div>
        <h2>Channel Relationships</h2>
        <ul>
          {"".join(f"<li><strong>{esc(name)}</strong>: {count}</li>" for name, count in relationship_counts.items())}
        </ul>
      </div>
      <div>
        <h2>Topic Mix</h2>
        <ul>
          {"".join(f"<li><strong>{esc(name)}</strong>: {count}</li>" for name, count in topic_counts.most_common()) or "<li>No summaries yet.</li>"}
        </ul>
      </div>
      <div>
        <h2>Update Log</h2>
        <ul>
          {"".join(f"<li><strong>{esc(run.get('timestamp'))}</strong> {esc(run.get('stage'))}: {esc({k: v for k, v in run.items() if k not in ['timestamp', 'stage']})}</li>" for run in runs[-8:]) or "<li>No runs yet.</li>"}
        </ul>
      </div>
    </section>
  </main>
  <footer>
    Built at {esc(now_iso())}. Source videos remain on YouTube; this page publishes only derived summaries and short evidence snippets.
  </footer>
</body>
</html>
"""
    (SITE_DIR / "index.html").write_text(html_doc, encoding="utf-8")
    (SITE_DIR / "styles.css").write_text(
        """
:root { color-scheme: light; --ink:#1d2433; --muted:#667085; --line:#d9dee8; --bg:#f7f8fb; --accent:#0f766e; --chip:#e8f3f1; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--ink); background: var(--bg); }
header { padding: 32px 28px 20px; background: #fff; border-bottom: 1px solid var(--line); }
h1 { margin: 0 0 8px; font-size: 32px; letter-spacing: 0; }
h2 { margin: 0 0 14px; font-size: 20px; }
p { color: var(--muted); max-width: 900px; }
main { padding: 24px 28px 40px; }
.stats { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.stats span, .pill, .status { display: inline-flex; align-items: center; min-height: 28px; padding: 4px 9px; border: 1px solid var(--line); background: #fff; border-radius: 8px; font-size: 13px; }
.table-wrap { overflow-x: auto; border: 1px solid var(--line); background: #fff; }
table { width: 100%; min-width: 1500px; border-collapse: collapse; }
th, td { padding: 12px; border-bottom: 1px solid var(--line); vertical-align: top; font-size: 14px; }
th { position: sticky; top: 0; background: #eef2f7; text-align: left; color: #344054; }
a { color: #075985; font-weight: 650; text-decoration: none; }
ul, ol { margin: 0; padding-left: 18px; }
li { margin-bottom: 6px; }
.meta { margin-top: 6px; color: var(--muted); font-size: 12px; }
.pill { margin: 0 4px 4px 0; background: var(--chip); border-color: #b8d8d2; color: #115e59; }
.status.complete { background: #ecfdf3; border-color: #abefc6; color: #067647; }
.status.failed { background: #fff1f3; border-color: #fea3b4; color: #c01048; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 24px; }
.grid > div { background: #fff; border: 1px solid var(--line); padding: 18px; }
footer { padding: 20px 28px; color: var(--muted); border-top: 1px solid var(--line); background: #fff; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } header, main, footer { padding-left: 16px; padding-right: 16px; } }
""".strip()
        + "\n",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.parse_args()
    build_site()
    print(f"Wrote {SITE_DIR / 'index.html'}")


if __name__ == "__main__":
    main()
