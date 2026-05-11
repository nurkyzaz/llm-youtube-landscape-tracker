from __future__ import annotations

import argparse
import json
import os
import re
from typing import Any

import requests

from .common import VIDEOS_PATH, append_run, now_iso, read_json, write_json
from .transcribe import fetch_transcript, transcript_text, webshare_configured

MODEL_ENDPOINT = os.getenv("GITHUB_MODELS_ENDPOINT", "https://models.github.ai/inference/chat/completions")
MODEL_NAME = os.getenv("GITHUB_MODEL", "openai/gpt-4o-mini")
TOPIC_KEYWORDS = {
    "model releases": ["gpt", "claude", "gemini", "llama", "mistral", "model release", "frontier"],
    "agents": ["agent", "tool use", "workflow", "autonomous", "computer use"],
    "RAG": ["rag", "retrieval", "embedding", "vector database", "knowledge base"],
    "evals": ["benchmark", "eval", "score", "leaderboard", "test"],
    "coding": ["code", "programming", "developer", "copilot", "cursor"],
    "research papers": ["paper", "arxiv", "research", "method", "architecture"],
    "tooling": ["tool", "app", "platform", "product", "workflow"],
    "safety": ["safety", "alignment", "risk", "jailbreak", "guardrail"],
    "enterprise adoption": ["enterprise", "business", "governance", "production", "company"],
    "AI tools": ["tool", "plugin", "assistant", "automation", "productivity"],
    "multimodal": ["image", "audio", "video", "speech", "vision", "multimodal"],
    "LLM applications": ["application", "app", "chatbot", "assistant", "workflow", "pipeline"],
}

MODEL_TOOL_PATTERNS = {
    "GPT": r"\b(?:gpt[- ]?\d(?:\.\d)?|gpt[- ]?4o|gpt[- ]?4\.1|chatgpt|openai)\b",
    "Claude": r"\b(?:claude|sonnet|opus|haiku|anthropic)\b",
    "Gemini": r"\b(?:gemini|google ai)\b",
    "Llama": r"\b(?:llama ?\d?|meta llama)\b",
    "Mistral": r"\b(?:mistral|mixtral)\b",
    "Qwen": r"\bqwen\b",
    "DeepSeek": r"\bdeepseek\b",
    "Grok": r"\bgrok\b",
    "Phi": r"\bphi[- ]?\d?\b",
    "LangChain": r"\blangchain\b",
    "LangGraph": r"\blanggraph\b",
    "DSPy": r"\bdspy\b",
    "RAG": r"\b(?:rag|retrieval augmented generation)\b",
    "vLLM": r"\bvllm\b",
    "TGI": r"\btgi\b",
    "Ollama": r"\bollama\b",
    "Cursor": r"\bcursor\b",
    "Copilot": r"\bcopilot\b",
    "Perplexity": r"\bperplexity\b",
    "Hugging Face": r"\bhugging ?face\b",
}

ACTION_VERBS = {
    "released", "announced", "shows", "showed", "improves", "improved", "uses", "used",
    "builds", "built", "compares", "tested", "explains", "argues", "claims", "reduces",
    "increases", "outperforms", "fails", "works", "launches", "supports",
}

FILLER_WORDS = {
    "like", "just", "really", "actually", "basically", "kind", "sort", "thing", "things",
    "yeah", "okay", "right", "you", "know", "um", "uh",
}


def compact_json(text: str) -> dict[str, Any]:
    match = re.search(r"\{.*\}", text, flags=re.S)
    if not match:
        raise ValueError("model response did not contain JSON")
    return json.loads(match.group(0))


def validate_summary(value: dict[str, Any]) -> dict[str, Any]:
    defaults: dict[str, Any] = {
        "speaker": "Unknown",
        "topics": [],
        "claims": [],
        "tools_models_mentioned": [],
        "stance": "descriptive",
        "evidence_snippets": [],
        "channel_relationship": "",
        "summary": "",
    }
    for key, default in defaults.items():
        value.setdefault(key, default)
    for key in ["topics", "claims", "tools_models_mentioned", "evidence_snippets"]:
        if not isinstance(value[key], list):
            value[key] = [str(value[key])]
        value[key] = [str(item).strip()[:240] for item in value[key] if str(item).strip()][:6]
    for key in ["speaker", "stance", "channel_relationship", "summary"]:
        value[key] = str(value.get(key, "")).strip()[:1200]
    return value


def summarize_with_github_models(video: dict[str, Any], text: str) -> dict[str, Any]:
    token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
    if not token:
        raise RuntimeError("GITHUB_TOKEN is not set")

    prompt = f"""
Return strict JSON for a YouTube video about large language models.

Video:
- title: {video.get('title')}
- channel: {video.get('channel')}
- known channel relationship: {video.get('relationship')}

Schema:
{{
  "speaker": "host or guest if inferable, otherwise channel name",
  "topics": ["model releases|agents|RAG|evals|coding|research papers|tooling|safety|enterprise adoption"],
  "claims": ["short transcript-backed claims"],
  "tools_models_mentioned": ["LLMs, tools, frameworks, companies"],
  "stance": "optimistic|skeptical|critical|tutorial|descriptive|mixed",
  "evidence_snippets": ["short quotes or close paraphrases with timestamp hints if present"],
  "channel_relationship": "how this channel relates to the other LLM channels",
  "summary": "2-3 concise sentences grounded in the transcript"
}}

Transcript excerpt:
{text[:24000]}
"""
    response = requests.post(
        MODEL_ENDPOINT,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": "You produce concise, evidence-grounded JSON for media monitoring."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 1800,
        },
        timeout=60,
    )
    response.raise_for_status()
    payload = response.json()
    content = payload["choices"][0]["message"]["content"]
    return validate_summary(compact_json(content))


def split_sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if len(s.strip()) > 45]


def extract_tools_models(text: str) -> list[str]:
    found: list[str] = []
    lower = text.lower()
    for label, pattern in MODEL_TOOL_PATTERNS.items():
        if re.search(pattern, lower, flags=re.I) and label not in found:
            found.append(label)
    return found[:8]


def filler_ratio(sentence: str) -> float:
    words = re.findall(r"[a-zA-Z']+", sentence.lower())
    if not words:
        return 1.0
    return sum(1 for word in words if word in FILLER_WORDS) / len(words)


def score_sentence(sentence: str, tools: list[str]) -> float:
    lower = sentence.lower()
    words = re.findall(r"[a-zA-Z']+", lower)
    score = min(len(words), 40) / 8
    score += sum(3 for tool in tools if tool.lower() in lower)
    score += sum(2 for topic_words in TOPIC_KEYWORDS.values() for keyword in topic_words if keyword in lower)
    score += sum(2 for verb in ACTION_VERBS if re.search(rf"\b{re.escape(verb)}\b", lower))
    score -= filler_ratio(sentence) * 12
    if len(words) < 8:
        score -= 4
    return score


def select_informative_sentences(text: str, tools: list[str], limit: int) -> list[str]:
    scored = [(score_sentence(sentence, tools), index, sentence) for index, sentence in enumerate(split_sentences(text))]
    scored.sort(key=lambda item: (-item[0], item[1]))
    selected = [sentence for score, _, sentence in scored if score > 0]
    if len(selected) < limit:
        selected.extend(sentence for _, _, sentence in scored if sentence not in selected)
    return selected[:limit]


def heuristic_summary(video: dict[str, Any], text: str) -> dict[str, Any]:
    lower = text.lower()
    topics = [topic for topic, words in TOPIC_KEYWORDS.items() if any(word in lower for word in words)]
    tools = extract_tools_models(text)
    sentences = select_informative_sentences(text, tools, 6)
    evidence = sentences[:3]
    claims = [sentence[:220] for sentence in sentences[:4]]
    summary_sentences = sentences[:2] or [video.get("title", "Transcript summary pending.")]
    return validate_summary(
        {
            "speaker": video.get("channel", "Unknown"),
            "topics": topics[:5] or ["tooling"],
            "claims": claims,
            "tools_models_mentioned": tools,
            "stance": "descriptive",
            "evidence_snippets": evidence,
            "channel_relationship": video.get("relationship", ""),
            "summary": " ".join(summary_sentences)[:900],
        }
    )


def summarize_video(video: dict[str, Any]) -> dict[str, Any]:
    segments, provider = fetch_transcript(video)
    text = transcript_text(segments)
    video["transcript_status"] = "available"
    video["transcript_provider"] = provider
    video["transcript_checked_at"] = now_iso()
    video["transcript_characters"] = len(text)
    try:
        summary = summarize_with_github_models(video, text)
        summary["summary_provider"] = MODEL_NAME
    except Exception as exc:
        summary = heuristic_summary(video, text)
        summary["summary_provider"] = "local-heuristic"
        summary["provider_error"] = str(exc)[:500]
    return summary


def is_transcript_error(exc: Exception) -> bool:
    text = str(exc).lower()
    return any(marker in text for marker in ["transcript", "youtube", "yt-dlp", "caption", "subtitles", "proxy", "ip"])


def summarize_pending(max_videos: int) -> dict[str, Any]:
    videos = read_json(VIDEOS_PATH, [])
    if os.getenv("GITHUB_ACTIONS") and not webshare_configured():
        event = {
            "stage": "summarize",
            "attempted": 0,
            "completed": 0,
            "failed": 0,
            "proxy_configured": False,
            "warning": "WEBSHARE_USER/WEBSHARE_PASS secrets are not configured; skipping hosted transcript fetch because YouTube blocks many cloud-runner IPs.",
        }
        append_run(event)
        return event

    attempted = 0
    completed = 0
    failed = 0
    for video in videos:
        if attempted >= max_videos:
            break
        if video.get("summary_status") == "complete":
            continue
        attempted += 1
        try:
            video["summary"] = summarize_video(video)
            video["summary_status"] = "complete"
            video["summarized_at"] = now_iso()
            video.pop("summary_error", None)
            completed += 1
        except Exception as exc:
            video["summary_status"] = "failed"
            if is_transcript_error(exc):
                video["transcript_status"] = "transcript_unavailable"
            video["summary_error"] = str(exc)[:500]
            video["summarized_at"] = now_iso()
            failed += 1
    write_json(VIDEOS_PATH, videos)
    event = {
        "stage": "summarize",
        "attempted": attempted,
        "completed": completed,
        "failed": failed,
        "proxy_configured": webshare_configured(),
    }
    if not webshare_configured():
        event["warning"] = "WEBSHARE_USER/WEBSHARE_PASS secrets are not configured; GitHub-hosted runners may be blocked by YouTube."
    append_run(event)
    return event


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-videos", type=int, default=12)
    args = parser.parse_args()
    print(summarize_pending(args.max_videos))


if __name__ == "__main__":
    main()
