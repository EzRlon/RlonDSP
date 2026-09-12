import sys
from pathlib import Path

needles = ["EchoMusic", "hoowhoami", "echo-music", "LemuDSP", "LemuWang", "Designed by LemuWang"]
root = Path(sys.argv[1])
binary_exts = {".exe", ".dll", ".pak", ".bin", ".dat", ".ico", ".png", ".jpg", ".jpeg", ".node"}

for path in root.rglob("*"):
    if not path.is_file():
        continue
    if path.suffix.lower() in binary_exts:
        continue
    try:
        data = path.read_bytes()
    except Exception:
        continue
    for needle in needles:
        if needle.encode("utf-8") in data or needle.encode("utf-16le") in data:
            print(path.relative_to(root), "contains", needle)
