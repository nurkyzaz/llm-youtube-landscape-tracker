from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
SITE_DIR = ROOT / "site"
CHANNELS_PATH = DATA_DIR / "channels.json"
VIDEOS_PATH = DATA_DIR / "videos.json"
RUNS_PATH = DATA_DIR / "runs.json"


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as handle:
        json.dump(value, handle, ensure_ascii=False, indent=2, sort_keys=True)
        handle.write("\n")
    tmp.replace(path)


def append_run(event: dict[str, Any]) -> None:
    runs = read_json(RUNS_PATH, [])
    runs.append({"timestamp": now_iso(), **event})
    write_json(RUNS_PATH, runs[-100:])


def video_url(video_id: str) -> str:
    return f"https://www.youtube.com/watch?v={video_id}"
