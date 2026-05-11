from __future__ import annotations

import argparse
import time
import os
import shutil
import subprocess
import tempfile
import textwrap
import urllib.request
from pathlib import Path

from .common import ROOT, SITE_DIR

BABEL_URL = "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"
JSX_FILES = ["tweaks-panel.jsx", "ui.jsx", "app.jsx"]


def node_binary() -> str:
    configured = os.getenv("NODE_BINARY")
    if configured:
        return configured
    bundled = Path.home() / ".cache" / "codex-runtimes" / "codex-primary-runtime" / "dependencies" / "node" / "bin" / "node"
    if bundled.exists():
        return str(bundled)
    found = shutil.which("node")
    if found:
        return found
    raise RuntimeError("node is required to build the frontend bundle")


def fetch_babel(cache_dir: Path) -> Path:
    cache_dir.mkdir(parents=True, exist_ok=True)
    target = cache_dir / "babel-standalone-7.29.0.min.js"
    if target.exists() and target.stat().st_size > 1_000_000:
        return target
    for attempt in range(3):
        tmp = target.with_suffix(".tmp")
        try:
            with urllib.request.urlopen(BABEL_URL, timeout=90) as response, tmp.open("wb") as handle:
                while True:
                    chunk = response.read(1024 * 256)
                    if not chunk:
                        break
                    handle.write(chunk)
            if tmp.stat().st_size < 1_000_000:
                raise RuntimeError(f"downloaded Babel bundle is unexpectedly small: {tmp.stat().st_size} bytes")
            tmp.replace(target)
            break
        except Exception:
            if tmp.exists():
                tmp.unlink()
            if attempt == 2:
                raise
            time.sleep(2)
    return target


def build_frontend() -> Path:
    for name in JSX_FILES:
        if not (SITE_DIR / name).exists():
            raise FileNotFoundError(f"Missing {SITE_DIR / name}")

    assets_dir = SITE_DIR / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)
    output = assets_dir / "app.js"
    babel_path = fetch_babel(ROOT / ".cache")

    with tempfile.TemporaryDirectory() as tmp:
        runner = Path(tmp) / "build-frontend.js"
        runner.write_text(
            textwrap.dedent(
                """
                const fs = require("fs");
                const vm = require("vm");
                const [babelPath, outPath, ...inputs] = process.argv.slice(2);
                const context = { console };
                context.window = context;
                context.self = context;
                context.global = context;
                vm.runInNewContext(fs.readFileSync(babelPath, "utf8"), context);
                const pieces = inputs.map((input) => {
                  const source = fs.readFileSync(input, "utf8");
                  const result = context.Babel.transform(source, {
                    presets: [["react", { runtime: "classic" }]],
                    filename: input,
                    comments: false,
                    compact: false,
                  });
                  return `\\n/* ${input} */\\n(function(){\\n${result.code}\\n})();\\n`;
                });
                fs.writeFileSync(outPath, pieces.join("\\n"), "utf8");
                """
            ),
            encoding="utf-8",
        )
        subprocess.run(
            [node_binary(), str(runner), str(babel_path), str(output), *[str(SITE_DIR / name) for name in JSX_FILES]],
            check=True,
            cwd=ROOT,
        )
    return output


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.parse_args()
    output = build_frontend()
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
