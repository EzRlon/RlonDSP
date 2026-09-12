# RlonDSP
# Copyright © 2026 RlonDSP. All rights reserved.
# Based on Echomusic open-source project, modified and extended for RlonDSP.

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

HEADERS = {
    ".js": "/*\n * RlonDSP\n * Copyright © 2026 RlonDSP. All rights reserved.\n * Based on Echomusic open-source project, modified and extended for RlonDSP.\n */\n",
    ".css": "/*\n * RlonDSP\n * Copyright © 2026 RlonDSP. All rights reserved.\n * Based on Echomusic open-source project, modified and extended for RlonDSP.\n */\n",
    ".py": "# RlonDSP\n# Copyright © 2026 RlonDSP. All rights reserved.\n# Based on Echomusic open-source project, modified and extended for RlonDSP.\n",
    ".cs": "// RlonDSP\n// Copyright © 2026 RlonDSP. All rights reserved.\n// Based on Echomusic open-source project, modified and extended for RlonDSP.\n",
    ".html": "<!--\n RlonDSP\n Copyright © 2026 RlonDSP. All rights reserved.\n Based on Echomusic open-source project, modified and extended for RlonDSP.\n-->\n",
}

TARGETS = [
    ROOT / "main.js",
    ROOT / "preload.js",
    ROOT / "lyrics-preload.js",
    ROOT / "src",
    ROOT / "tools",
]


def has_header(text: str) -> bool:
    return "Copyright © 2026 RlonDSP" in text


def add_header(path: Path, header: str) -> bool:
    text = path.read_text(encoding="utf-8", errors="replace")
    if has_header(text):
        return False

    if path.suffix == ".html":
        doctype = re.search(r"<!DOCTYPE html[^>]*>\r?\n?", text, flags=re.I)
        if doctype:
            end = doctype.end()
            text = text[:end] + header + text[end:]
        else:
            text = header + text
    else:
        text = header + text

    path.write_text(text, encoding="utf-8", newline="")
    return True


def main():
    changed = []
    for target in TARGETS:
        paths = [target] if target.is_file() else [p for p in target.rglob("*") if p.is_file()]
        for path in paths:
            header = HEADERS.get(path.suffix.lower())
            if not header:
                continue
            if add_header(path, header):
                changed.append(str(path.relative_to(ROOT)))

    print("updated files:")
    print("\n".join(changed) if changed else "(none)")


if __name__ == "__main__":
    main()
