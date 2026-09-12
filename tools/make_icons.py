from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
out = root / "assets"
out.mkdir(parents=True, exist_ok=True)


def make_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    def lerp(a, b, t):
        return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

    start = (76, 125, 255)
    end = (122, 92, 255)
    for y in range(size):
        color = lerp(start, end, y / max(1, size - 1))
        draw.line([(0, y), (size, y)], fill=color + (255,))

    radius = max(4, size // 7)
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    img.putalpha(mask)

    bars = [
        (0.22, 0.35),
        (0.38, 0.68),
        (0.54, 0.47),
        (0.70, 0.80),
    ]
    bar_width = size * 0.10
    baseline = size * 0.76
    for x_ratio, height_ratio in bars:
        x = size * x_ratio
        h = size * 0.48 * height_ratio
        draw.rounded_rectangle(
            [x - bar_width / 2, baseline - h, x + bar_width / 2, baseline],
            radius=bar_width / 2,
            fill=(255, 255, 255, 255),
        )
    return img


icon = make_icon(256)
icon.save(out / "icon.png", format="PNG")
icon.save(out / "tray.png", format="PNG")
icon.resize((32, 32), Image.LANCZOS).save(out / "tray32.png", format="PNG")

icon_ico = make_icon(256)
icon_ico.save(
    out / "icon.ico",
    format="ICO",
    sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)

print("icons generated in", out)
