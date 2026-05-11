from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from typing import Any

from .common import CHANNELS_PATH, RUNS_PATH, SITE_DIR, VIDEOS_PATH, read_json

TOPIC_ORDER = [
    "model releases",
    "agents",
    "RAG",
    "evals",
    "coding",
    "research papers",
    "tooling",
    "safety",
    "enterprise adoption",
    "AI tools",
    "multimodal",
    "LLM applications",
]

STANCE_MAP = {
    "optimistic": "hype",
    "hype": "hype",
    "skeptical": "skeptical",
    "critical": "skeptical",
    "mixed": "analytical",
    "analytical": "analytical",
    "tutorial": "analytical",
    "descriptive": "neutral",
    "neutral": "neutral",
}

MODEL_STOPWORDS = {"And", "The", "This", "They", "Can", "What", "Now", "Well", "Basically", "So", "There", "That"}


def parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)
    except ValueError:
        return None


def days_ago(value: str | None) -> int:
    dt = parse_dt(value)
    if not dt:
        return 999
    delta = datetime.now(timezone.utc) - dt
    return max(0, delta.days)


def clean_list(items: Any, fallback: list[str] | None = None) -> list[str]:
    values = items if isinstance(items, list) else []
    out: list[str] = []
    for item in values:
        text = str(item).strip()
        if text and text not in out:
            out.append(text)
    return out or (fallback or [])


def channel_key(index: int) -> str:
    return chr(ord("A") + index) if index < 26 else f"C{index + 1}"


def estimate_duration_minutes(video: dict[str, Any]) -> int:
    chars = int(video.get("transcript_characters") or 0)
    if chars <= 0:
        return 0
    return max(1, round(chars / 900))


def map_stance(value: str | None) -> str:
    return STANCE_MAP.get(str(value or "").lower(), "neutral")


def clean_models(items: Any) -> list[str]:
    models = []
    for item in clean_list(items, ["LLM"]):
        if item in MODEL_STOPWORDS or len(item) <= 1:
            continue
        models.append(item)
    return models or ["LLM"]


def video_to_frontend(video: dict[str, Any], channel_ids: dict[str, str]) -> dict[str, Any]:
    summary = video.get("summary") if isinstance(video.get("summary"), dict) else {}
    topics = clean_list(summary.get("topics"), clean_list(video.get("channel_focus"), ["LLM applications"]))
    models = clean_models(summary.get("tools_models_mentioned"))
    claims = clean_list(summary.get("claims"))
    evidence = clean_list(summary.get("evidence_snippets"))
    quote = evidence[0] if evidence else (claims[0] if claims else summary.get("summary", "Transcript summary pending."))
    excerpt = summary.get("summary") or video.get("summary_error") or "Transcript-backed summary is queued for the next run."
    published = parse_dt(video.get("published_at"))
    channel_id = channel_ids.get(video.get("channel"), video.get("channel_id", "unknown"))

    return {
        "id": video.get("video_id"),
        "sourceUrl": video.get("url"),
        "channelId": channel_id,
        "channel": video.get("channel"),
        "title": video.get("title"),
        "date": published.date().isoformat() if published else "",
        "publishedAt": video.get("published_at"),
        "daysAgo": days_ago(video.get("published_at")),
        "duration": estimate_duration_minutes(video),
        "views": 0,
        "topics": topics,
        "models": models,
        "stance": map_stance(summary.get("stance")),
        "relationship": video.get("relationship"),
        "status": video.get("summary_status"),
        "transcriptStatus": video.get("transcript_status"),
        "transcriptProvider": video.get("transcript_provider", "n/a"),
        "summaryProvider": summary.get("summary_provider", "pending"),
        "new": days_ago(video.get("published_at")) < 2,
        "transcript": {
            "quote": str(quote)[:320],
            "excerpt": str(excerpt)[:500],
            "bullets": (claims or evidence or [excerpt])[:5],
        },
    }


def build_channels(channels: list[dict[str, Any]], videos: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, str]]:
    names = [channel["name"] for channel in channels]
    for video in videos:
        if video.get("channel") and video["channel"] not in names:
            names.append(video["channel"])

    by_name = {channel["name"]: channel for channel in channels}
    frontend_channels: list[dict[str, Any]] = []
    ids: dict[str, str] = {}
    for index, name in enumerate(names):
        source = by_name.get(name, {})
        key = channel_key(index)
        ids[name] = key
        frontend_channels.append(
            {
                "id": key,
                "name": name,
                "desc": source.get("relationship", "LLM coverage"),
                "focus": clean_list(source.get("focus"), ["LLM applications"]),
                "subs": "tracked",
                "cadence": "RSS",
                "url": source.get("url", ""),
            }
        )
    return frontend_channels, ids


def build_topics(videos: list[dict[str, Any]], channels: list[dict[str, Any]]) -> list[str]:
    seen: list[str] = []
    for topic in TOPIC_ORDER:
        if topic not in seen:
            seen.append(topic)
    for channel in channels:
        for topic in clean_list(channel.get("focus")):
            if topic not in seen:
                seen.append(topic)
    for video in videos:
        summary = video.get("summary") if isinstance(video.get("summary"), dict) else {}
        for topic in clean_list(summary.get("topics")):
            if topic not in seen:
                seen.append(topic)
    return seen


def build_models(frontend_videos: list[dict[str, Any]]) -> list[str]:
    models: list[str] = []
    for video in frontend_videos:
        for model in video.get("models", []):
            if model not in MODEL_STOPWORDS and len(model) > 1 and model not in models:
                models.append(model)
    return models or ["LLM"]


def build_matrix(channels: list[dict[str, Any]], topics: list[str], videos: list[dict[str, Any]]) -> dict[str, dict[str, int]]:
    matrix = {channel["id"]: {topic: 0 for topic in topics} for channel in channels}
    for video in videos:
        channel_id = video["channelId"]
        if channel_id not in matrix:
            continue
        for topic in video.get("topics", []):
            if topic in matrix[channel_id]:
                matrix[channel_id][topic] += 1
    return matrix


def stage_message(run: dict[str, Any]) -> str:
    stage = run.get("stage", "run")
    if stage == "ingest":
        return f"{run.get('fetched', 0)} videos fetched, {run.get('new_videos', 0)} new"
    if stage == "summarize":
        return f"{run.get('completed', 0)} summaries completed, {run.get('failed', 0)} queued/failed"
    if stage == "transcribe":
        return f"{run.get('available', 0)} transcripts available, {run.get('unavailable', 0)} unavailable"
    return json.dumps({k: v for k, v in run.items() if k not in ["timestamp", "stage"]}, ensure_ascii=False)


def build_log(runs: list[dict[str, Any]], videos: list[dict[str, Any]]) -> list[dict[str, Any]]:
    latest_video = videos[0] if videos else {}
    log: list[dict[str, Any]] = []
    for run in runs[-30:]:
        dt = parse_dt(run.get("timestamp"))
        log.append(
            {
                "t": int(dt.timestamp() * 1000) if dt else 0,
                "verb": run.get("stage", "run"),
                "msg": stage_message(run),
                "channel": latest_video.get("channel", "tracker"),
                "vid": latest_video.get("video_id", ""),
                "title": latest_video.get("title", "Pipeline run"),
            }
        )
    return log


def latest_timestamp(runs: list[dict[str, Any]]) -> str:
    for run in reversed(runs):
        if run.get("timestamp"):
            return str(run["timestamp"])
    return ""


def latest_warning(runs: list[dict[str, Any]]) -> str:
    for run in reversed(runs):
        if run.get("warning"):
            return str(run["warning"])
    return ""


def write_data_js(payload: dict[str, Any]) -> None:
    SITE_DIR.mkdir(parents=True, exist_ok=True)
    body = json.dumps(payload, ensure_ascii=False, indent=2)
    (SITE_DIR / "data.js").write_text(f"window.__DATA__ = {body};\n", encoding="utf-8")


def ensure_design_files() -> None:
    required = ["index.html", "app.jsx", "ui.jsx", "tweaks-panel.jsx"]
    missing = [name for name in required if not (SITE_DIR / name).exists()]
    if missing:
        raise FileNotFoundError(f"Missing design files in site/: {', '.join(missing)}")


def build_site() -> None:
    ensure_design_files()
    channels = read_json(CHANNELS_PATH, [])
    backend_videos = read_json(VIDEOS_PATH, [])
    runs = read_json(RUNS_PATH, [])
    frontend_channels, channel_ids = build_channels(channels, backend_videos)
    frontend_videos = [video_to_frontend(video, channel_ids) for video in backend_videos]
    frontend_videos = [video for video in frontend_videos if video.get("id")]
    topics = build_topics(backend_videos, channels)
    models = build_models(frontend_videos)
    matrix = build_matrix(frontend_channels, topics, frontend_videos)
    log = build_log(runs, backend_videos)

    payload = {
        "CHANNELS": frontend_channels,
        "TOPICS": topics,
        "MODELS": models,
        "VIDEOS": frontend_videos,
        "MATRIX": matrix,
        "INGEST_LOG": log,
        "META": {
            "source": "YouTube RSS + captions + transcript-backed summaries",
            "repository": "https://github.com/nurkyzaz/llm-youtube-landscape-tracker",
            "site": "https://nurkyzaz.github.io/llm-youtube-landscape-tracker/",
            "lastUpdated": latest_timestamp(runs),
            "warning": latest_warning(runs),
        },
    }
    write_data_js(payload)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.parse_args()
    build_site()
    print(f"Wrote {SITE_DIR / 'data.js'}")


if __name__ == "__main__":
    main()
