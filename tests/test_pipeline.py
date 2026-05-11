import unittest
import json
import re
from pathlib import Path

from scripts.build_site import build_site
from scripts.ingest import merge_videos, parse_feed
from scripts.summarize import heuristic_summary, validate_summary


class PipelineTests(unittest.TestCase):
    def test_parse_feed(self):
        xml = Path("tests/fixtures/rss.xml").read_text(encoding="utf-8")
        rows = parse_feed(
            xml,
            {"name": "Example Channel", "url": "https://example.test", "relationship": "education", "focus": ["agents"]},
            "UC123",
            5,
        )
        self.assertEqual(rows[0]["video_id"], "abc123")
        self.assertEqual(rows[0]["relationship"], "education")

    def test_merge_preserves_summary(self):
        existing = [{"video_id": "abc123", "summary_status": "complete", "summary": {"topics": ["agents"]}}]
        incoming = [{"video_id": "abc123", "title": "New title", "summary_status": "pending"}]
        merged, added = merge_videos(existing, incoming)
        self.assertEqual(added, 0)
        self.assertEqual(merged[0]["summary_status"], "complete")
        self.assertEqual(merged[0]["title"], "New title")

    def test_summary_schema(self):
        summary = heuristic_summary({"channel": "Example", "title": "RAG agents"}, "Agents use retrieval and vector databases for RAG. Benchmarks test coding models.")
        valid = validate_summary(summary)
        self.assertIn("topics", valid)
        self.assertTrue(valid["summary"])

    def test_build_site(self):
        build_site()
        html = Path("site/index.html").read_text(encoding="utf-8")
        data_js = Path("site/data.js").read_text(encoding="utf-8")
        payload = json.loads(re.sub(r"^window.__DATA__ = |;\n?$", "", data_js))
        self.assertIn("LLM YouTube Landscape Tracker", html)
        self.assertIn("VIDEOS", payload)
        self.assertIn("CHANNELS", payload)
        self.assertIn("MATRIX", payload)


if __name__ == "__main__":
    unittest.main()
