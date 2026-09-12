# RlonDSP
# Copyright © 2026 RlonDSP. All rights reserved.
# Based on Echomusic open-source project, modified and extended for RlonDSP.
import json
import struct
import sys
from pathlib import Path


def parse_header(asar_path):
    with open(asar_path, "rb") as f:
        assert f.read(4) == b"\x04\x00\x00\x00"
        f.read(4)
        f.read(4)
        header_size = struct.unpack("<I", f.read(4))[0]
        header = json.loads(f.read(header_size))
        data_base = (f.tell() + 3) & ~3
    return header, data_base


def walk(node, prefix=""):
    files = node.get("files", {})
    for name, child in files.items():
        path = f"{prefix}/{name}" if prefix else name
        if "files" in child:
            yield path, child, True
            yield from walk(child, path)
        else:
            yield path, child, False


def extract(asar_path, roots, output_dir):
    header, data_base = parse_header(asar_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    root_nodes = {}
    for root in roots:
        if root == ".":
            node = header
        else:
            node = header
            for part in root.split("/"):
                node = node.get("files", {}).get(part)
                if node is None:
                    break
        if node is not None:
            root_nodes[root] = node

    count = 0
    with open(asar_path, "rb") as f:
        for root, node in root_nodes.items():
            target = output_dir / root
            target.mkdir(parents=True, exist_ok=True)
            for rel_path, child, is_dir in walk(node):
                out_path = target / rel_path
                if is_dir:
                    out_path.mkdir(parents=True, exist_ok=True)
                    continue
                out_path.parent.mkdir(parents=True, exist_ok=True)
                if "unpacked" in child:
                    print(f"skip unpacked {rel_path}", file=sys.stderr)
                    continue
                offset = int(child["offset"])
                size = int(child["size"])
                f.seek(data_base + offset)
                out_path.write_bytes(f.read(size))
                count += 1
    print(f"extracted {count} files")


if __name__ == "__main__":
    asar_file = Path(sys.argv[1])
    output = Path(sys.argv[2])
    roots = sys.argv[3:]
    if not roots:
        roots = ["."]
    extract(asar_file, roots, output)
