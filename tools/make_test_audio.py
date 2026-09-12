import math
import struct
import wave
from pathlib import Path

out = Path(__file__).resolve().parents[1] / "build" / "test_media"
out.mkdir(parents=True, exist_ok=True)

sample_rate = 44100
seconds = 8
frames = sample_rate * seconds

with wave.open(str(out / "test-tone.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(sample_rate)
    data = bytearray()
    for i in range(frames):
        t = i / sample_rate
        left = int(0.32 * 32767 * math.sin(2 * math.pi * 440 * t))
        right = int(0.32 * 32767 * math.sin(2 * math.pi * 554 * t))
        data += struct.pack("<hh", left, right)
    w.writeframes(bytes(data))

(out / "test-tone.lrc").write_text(
    "[00:00.00]测试歌词第一行\n"
    "[00:02.00]Testing lyric line two\n"
    "[00:04.00]测试歌词第三行\n",
    encoding="utf-8",
)

print("test audio written to", out)
