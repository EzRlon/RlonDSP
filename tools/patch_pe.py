# RlonDSP
# Copyright © 2026 RlonDSP. All rights reserved.
# Based on Echomusic open-source project, modified and extended for RlonDSP.
import sys
from pathlib import Path


def utf16_bytes(text: str) -> bytes:
    return text.encode("utf-16le")


def pad_to(data: bytes, length: int) -> bytes:
    if len(data) > length:
        raise ValueError(f"replacement too long: {len(data)} > {length}")
    return data + b"\x00" * (length - len(data))


def replace_all(data: bytes, old: str, new: str) -> bytes:
    old_bytes = utf16_bytes(old)
    new_bytes = pad_to(utf16_bytes(new), len(old_bytes))
    return data.replace(old_bytes, new_bytes)


def main():
    exe_path = Path(sys.argv[1])
    data = exe_path.read_bytes()
    replacements = {
        "EchoMusic": "RlonDSP",
        "hoowhoami": "RlonDSP",
        "LocalTune": "RlonDSP",
        "2.3.2-beta.3": "1.0.1.0",
        "2.3.2.0": "1.0.1.0",
        "1.0.0.0": "1.0.1.0",
    }
    for old, new in replacements.items():
        data = replace_all(data, old, new)
    exe_path.write_bytes(data)
    print("patched", exe_path)


if __name__ == "__main__":
    main()
