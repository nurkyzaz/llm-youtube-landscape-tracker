from __future__ import annotations

import argparse
import json
import shutil
import site
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from .common import VIDEOS_PATH, append_run, now_iso, read_json, write_json


def normalize_segments(raw_segments: list[dict[str, Any]], provider: str) -> list[dict[str, Any]]:
    segments: list[dict[str, Any]] = []
    for item in raw_segments:
        text = str(item.get("text", "")).replace("\n", " ").strip()
        if not text:
            continue
        start = float(item.get("start", 0) or 0)
        duration = float(item.get("duration", 0) or 0)
        segments.append({"start": round(start, 2), "duration": round(duration, 2), "text": text, "provider": provider})
    return segments


def fetch_with_youtube_transcript_api(video_id: str, languages: list[str]) -> list[dict[str, Any]]:
    from youtube_transcript_api import YouTubeTranscriptApi

    if hasattr(YouTubeTranscriptApi, "get_transcript"):
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=languages)
    else:
        transcript = YouTubeTranscriptApi().fetch(video_id, languages=languages).to_raw_data()
    return normalize_segments(transcript, "youtube-transcript-api")


def ytdlp_binary() -> str | None:
    binary = shutil.which("yt-dlp")
    if binary:
        return binary
    user_binary = Path(site.USER_BASE) / "bin" / "yt-dlp"
    if user_binary.exists():
        return str(user_binary)
    return None


def fetch_with_ytdlp(video_url: str, languages: list[str]) -> list[dict[str, Any]]:
    binary = ytdlp_binary()
    if not binary:
        raise RuntimeError("yt-dlp is not installed")

    with tempfile.TemporaryDirectory() as tmp:
        output = str(Path(tmp) / "%(id)s.%(ext)s")
        command = [
            binary,
            "--skip-download",
            "--write-auto-subs",
            "--write-subs",
            "--sub-format",
            "json3",
            "--sub-langs",
            ",".join(languages),
            "-o",
            output,
            video_url,
        ]
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=90)
        files = sorted(Path(tmp).glob("*.json3"))
        if not files:
            raise RuntimeError("yt-dlp did not produce json3 subtitles")
        payload = json.loads(files[0].read_text(encoding="utf-8"))
        raw = []
        for event in payload.get("events", []):
            parts = [seg.get("utf8", "") for seg in event.get("segs", []) if isinstance(seg, dict)]
            text = "".join(parts).strip()
            if text:
                raw.append(
                    {
                        "start": event.get("tStartMs", 0) / 1000,
                        "duration": event.get("dDurationMs", 0) / 1000,
                        "text": text,
                    }
                )
        return normalize_segments(raw, "yt-dlp")


def fetch_transcript(video: dict[str, Any], languages: list[str] | None = None) -> tuple[list[dict[str, Any]], str]:
    languages = languages or ["en", "en-US", "en-GB"]
    try:
        segments = fetch_with_youtube_transcript_api(video["video_id"], languages)
        return segments, "youtube-transcript-api"
    except Exception as first_error:
        try:
            segments = fetch_with_ytdlp(video["url"], languages)
            return segments, "yt-dlp"
        except Exception as second_error:
            raise RuntimeError(f"{first_error}; fallback failed: {second_error}") from second_error


def transcript_text(segments: list[dict[str, Any]], max_chars: int = 45000) -> str:
    text = " ".join(segment["text"] for segment in segments)
    return text[:max_chars]


def update_transcript_status(max_videos: int) -> dict[str, Any]:
    videos = read_json(VIDEOS_PATH, [])
    checked = 0
    available = 0
    unavailable = 0
    for video in videos:
        if checked >= max_videos:
            break
        if video.get("summary_status") == "complete":
            continue
        checked += 1
        try:
            segments, provider = fetch_transcript(video)
            if not segments:
                raise RuntimeError("empty transcript")
            video["transcript_status"] = "available"
            video["transcript_provider"] = provider
            video["transcript_checked_at"] = now_iso()
            video["transcript_characters"] = len(transcript_text(segments, 200000))
            video.pop("transcript_error", None)
            available += 1
        except Exception as exc:
            video["transcript_status"] = "transcript_unavailable"
            video["transcript_error"] = str(exc)[:500]
            video["transcript_checked_at"] = now_iso()
            unavailable += 1
    write_json(VIDEOS_PATH, videos)
    event = {"stage": "transcribe", "checked": checked, "available": available, "unavailable": unavailable}
    append_run(event)
    return event


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-videos", type=int, default=10)
    args = parser.parse_args()
    print(update_transcript_status(args.max_videos))


if __name__ == "__main__":
    main()
