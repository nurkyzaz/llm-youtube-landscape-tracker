import unittest
import json
import re
import os
import sys
import types
from pathlib import Path
from unittest.mock import Mock, patch

from scripts.build_site import build_site
from scripts.ingest import merge_videos, parse_feed
from scripts.build_site import video_to_frontend
from scripts.summarize import heuristic_summary, summarize_with_github_models, validate_summary


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
        text = (
            "OpenAI released GPT-4.1 for coding and long context. "
            "The demo shows LangGraph agents using RAG to retrieve documents and reduce tool-call errors. "
            "Basically like yeah this is cool. "
            "Claude and Gemini both improve multimodal reasoning benchmarks."
        )
        summary = heuristic_summary({"channel": "Example", "title": "RAG agents"}, text)
        valid = validate_summary(summary)
        self.assertIn("topics", valid)
        self.assertTrue(valid["summary"])
        self.assertNotIn("discusses", valid["summary"])
        self.assertIn("GPT", valid["tools_models_mentioned"])
        self.assertIn("LangGraph", valid["tools_models_mentioned"])
        self.assertNotIn("Basically", valid["tools_models_mentioned"])

    def test_github_models_response_parses(self):
        response = Mock()
        response.raise_for_status = Mock()
        response.json.return_value = {
            "choices": [
                {
                    "message": {
                        "content": json.dumps(
                            {
                                "speaker": "Host",
                                "topics": ["agents"],
                                "claims": ["Agents used tools."],
                                "tools_models_mentioned": ["LangGraph"],
                                "stance": "tutorial",
                                "evidence_snippets": ["The agent calls a tool."],
                                "channel_relationship": "framework/vendor",
                                "summary": "The host explains a tool-using agent.",
                            }
                        )
                    }
                }
            ]
        }
        with patch.dict(os.environ, {"GITHUB_TOKEN": "token"}), patch("scripts.summarize.requests.post", return_value=response) as post:
            summary = summarize_with_github_models({"title": "Agents", "channel": "Example"}, "The agent calls a tool.")
        self.assertEqual(summary["summary"], "The host explains a tool-using agent.")
        self.assertEqual(post.call_args.kwargs["json"]["max_tokens"], 1800)

    def test_webshare_proxy_config_is_used(self):
        import scripts.transcribe as transcribe

        class FakeProxy:
            def __init__(self, proxy_username, proxy_password, **kwargs):
                self.proxy_username = proxy_username
                self.proxy_password = proxy_password

        class FakeApi:
            last_proxy = None

            def __init__(self, proxy_config=None):
                FakeApi.last_proxy = proxy_config

        fake_api_module = types.ModuleType("youtube_transcript_api")
        fake_api_module.YouTubeTranscriptApi = FakeApi
        fake_proxy_module = types.ModuleType("youtube_transcript_api.proxies")
        fake_proxy_module.WebshareProxyConfig = FakeProxy

        with patch.dict(os.environ, {"WEBSHARE_USER": "user", "WEBSHARE_PASS": "pass"}), patch.dict(
            sys.modules,
            {"youtube_transcript_api": fake_api_module, "youtube_transcript_api.proxies": fake_proxy_module},
        ):
            transcribe.transcript_api_client()
        self.assertEqual(FakeApi.last_proxy.proxy_username, "user")
        self.assertEqual(FakeApi.last_proxy.proxy_password, "pass")

    def test_build_site(self):
        build_site()
        html = Path("site/index.html").read_text(encoding="utf-8")
        data_js = Path("site/data.js").read_text(encoding="utf-8")
        payload = json.loads(re.sub(r"^window.__DATA__ = |;\n?$", "", data_js))
        self.assertIn("LLM YouTube Landscape Tracker", html)
        self.assertIn("VIDEOS", payload)
        self.assertIn("CHANNELS", payload)
        self.assertIn("MATRIX", payload)
        self.assertIn("lastUpdated", payload["META"])
        self.assertNotIn("babel", html.lower())
        self.assertIn("assets/app.js", html)

    def test_video_to_frontend_shape(self):
        video = {
            "video_id": "abc",
            "url": "https://youtube.test/watch?v=abc",
            "channel": "Example",
            "title": "Agents",
            "published_at": "2026-05-11T10:00:00+00:00",
            "summary_status": "complete",
            "transcript_status": "available",
            "summary": {
                "topics": ["agents"],
                "tools_models_mentioned": ["LangGraph"],
                "stance": "tutorial",
                "claims": ["The host builds an agent."],
                "summary": "The host builds an agent with LangGraph.",
            },
        }
        row = video_to_frontend(video, {"Example": "A"})
        self.assertEqual(row["channelId"], "A")
        self.assertEqual(row["models"], ["LangGraph"])
        self.assertEqual(row["transcript"]["bullets"], ["The host builds an agent."])


if __name__ == "__main__":
    unittest.main()
