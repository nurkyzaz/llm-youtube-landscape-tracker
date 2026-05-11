from __future__ import annotations

import argparse
import re
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Any

import requests

from .common import CHANNELS_PATH, VIDEOS_PATH, append_run, now_iso, read_json, video_url, write_json

USER_AGENT = "llm-youtube-landscape-tracker/1.0 (+https://github.com/)"
RSS_NS = {"atom": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}
CHANNEL_PATTERNS = [
    re.compile(r'"browseId":"(UC[^"]+)"'),
    re.compile(r'"externalId":"(UC[^"]+)"'),
    re.compile(r'<meta itemprop="channelId" content="(UC[^"]+)"'),
    re.compile(r'<link rel="canonical" href="https://www.youtube.com/channel/(UC[^"]+)"'),
]


def fetch_text(url: str, timeout: int = 20) -> str:
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=timeout)
    response.raise_for_status()
    return response.text


def resolve_channel_id(channel: dict[str, Any]) -> str:
    if channel.get("channel_id"):
        return str(channel["channel_id"])

    url = channel["url"]
    html = fetch_text(url)
    for pattern in CHANNEL_PATTERNS:
        match = pattern.search(html)
        if match:
            return match.group(1)
    raise ValueError(f"Could not resolve YouTube channel ID for {channel['name']} from {url}")


def rss_url(channel_id: str) -> str:
    return "https://www.youtube.com/feeds/videos.xml?" + urllib.parse.urlencode({"channel_id": channel_id})


def parse_date(value: str | None) -> str | None:
    if not value:
        return None
    try:
        return parsedate_to_datetime(value).astimezone(timezone.utc).isoformat()
    except Exception:
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc).isoformat()
        except Exception:
            return value


def parse_feed(xml_text: str, channel: dict[str, Any], channel_id: str, limit: int) -> list[dict[str, Any]]:
    root = ET.fromstring(xml_text)
    items: list[dict[str, Any]] = []
    for entry in root.findall("atom:entry", RSS_NS)[:limit]:
        video_id = (entry.findtext("yt:videoId", default="", namespaces=RSS_NS) or "").strip()
        if not video_id:
            continue
        title = (entry.findtext("atom:title", default="", namespaces=RSS_NS) or "").strip()
        author_name = entry.findtext("atom:author/atom:name", default=channel["name"], namespaces=RSS_NS)
        published = parse_date(entry.findtext("atom:published", namespaces=RSS_NS))
        updated = parse_date(entry.findtext("atom:updated", namespaces=RSS_NS))
        items.append(
            {
                "video_id": video_id,
                "url": video_url(video_id),
                "title": title,
                "channel": channel["name"],
                "channel_id": channel_id,
                "channel_url": channel["url"],
                "author": author_name,
                "published_at": published,
                "updated_at": updated,
                "relationship": channel.get("relationship", "unknown"),
                "channel_focus": channel.get("focus", []),
                "first_seen_at": now_iso(),
                "transcript_status": "pending",
                "summary_status": "pending",
            }
        )
    return items


def merge_videos(existing: list[dict[str, Any]], incoming: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], int]:
    by_id = {item["video_id"]: item for item in existing}
    added = 0
    for item in incoming:
        current = by_id.get(item["video_id"])
        if current:
            preserved = {
                key: current[key]
                for key in [
                    "first_seen_at",
                    "transcript_status",
                    "transcript_provider",
                    "transcript_error",
                    "transcript_checked_at",
                    "summary",
                    "summary_status",
                    "summary_error",
                    "summarized_at",
                ]
                if key in current
            }
            current.update(item)
            current.update(preserved)
        else:
            by_id[item["video_id"]] = item
            added += 1

    merged = sorted(by_id.values(), key=lambda row: row.get("published_at") or row.get("first_seen_at") or "", reverse=True)
    return merged, added


def ingest(limit_per_channel: int) -> dict[str, Any]:
    channels = read_json(CHANNELS_PATH, [])
    videos = read_json(VIDEOS_PATH, [])
    all_items: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []

    for channel in channels:
        try:
            channel_id = resolve_channel_id(channel)
            feed = fetch_text(rss_url(channel_id))
            all_items.extend(parse_feed(feed, channel, channel_id, limit_per_channel))
        except Exception as exc:
            failures.append({"channel": channel.get("name", "unknown"), "error": str(exc)})

    merged, added = merge_videos(videos, all_items)
    write_json(VIDEOS_PATH, merged)
    event = {
        "stage": "ingest",
        "channels": len(channels),
        "fetched": len(all_items),
        "new_videos": added,
        "failures": failures,
    }
    append_run(event)
    return event


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit-per-channel", type=int, default=5)
    args = parser.parse_args()
    print(ingest(args.limit_per_channel))


if __name__ == "__main__":
    main()
