"""Attach the shared New Year decoration to published HTML pages."""
import argparse
import re
import subprocess
from pathlib import Path


SCRIPT = b'<script src="/assets/new-year-decoration.js" defer></script>'
END_HEAD = re.compile(rb"</head\s*>", re.IGNORECASE)
END_BODY = re.compile(rb"</body\s*>", re.IGNORECASE)


def tracked_pages(directory):
    files = subprocess.check_output(
        ["git", "ls-files", "-z", "--", "*.html"], cwd=directory,
    )
    for name in files.decode().split("\0"):
        path = Path(name)
        if name and path.parts[0] not in {"tests", "tools"}:
            yield directory / path


def add_decoration(directory, tracked=False):
    pages = tracked_pages(directory) if tracked else directory.rglob("*.html")
    count = 0
    for path in sorted(pages):
        source = path.read_bytes()
        if SCRIPT in source:
            count += 1
            continue
        insertion = END_HEAD.search(source) or END_BODY.search(source)
        offset = insertion.start() if insertion else len(source)
        path.write_bytes(source[:offset] + b"\n" + SCRIPT + b"\n" + source[offset:])
        count += 1
    return count


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path)
    parser.add_argument("--tracked", action="store_true", help="Update published HTML source files tracked by Git.")
    args = parser.parse_args()
    if not (args.directory / "assets" / "new-year-decoration.js").is_file():
        parser.error("The directory must contain the built site and the New Year script.")
    print(f"New Year decoration connected to {add_decoration(args.directory, tracked=args.tracked)} HTML pages.")
