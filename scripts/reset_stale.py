from __future__ import annotations

import argparse

from .common import VIDEOS_PATH, read_json, write_json


def reset_stale() -> int:
    videos = read_json(VIDEOS_PATH, [])
    reset = 0
    for video in videos:
        summary = video.get("summary") if isinstance(video.get("summary"), dict) else {}
        if summary.get("summary_provider") != "local-heuristic":
            continue
        video["summary_status"] = "pending"
        for key in [
            "summary",
            "summary_error",
            "summarized_at",
        ]:
            video.pop(key, None)
        reset += 1
    write_json(VIDEOS_PATH, videos)
    return reset


def main() -> None:
    parser = argparse.ArgumentParser(description="Reset stale local-heuristic summaries to pending.")
    parser.parse_args()
    print(f"Reset {reset_stale()} stale summaries.")


if __name__ == "__main__":
    main()
