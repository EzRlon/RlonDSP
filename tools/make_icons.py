# RlonDSP
# Copyright © 2026 RlonDSP. All rights reserved.
# Based on Echomusic open-source project, modified and extended for RlonDSP.
#
# Flat app icon: a rounded-square tile with a bold "R" monogram.
# Flat fill only — no gradient, no signal bars.
# Regenerate with: python tools/make_icons.py
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
out = root / "assets"
out.mkdir(parents=True, exist_ok=True)

BLUE = (76, 125, 255, 255)
PURPLE = (122, 92, 255, 255)
WHITE = (255, 255, 255, 255)
FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
SS = 4  # supersample factor for smooth edges


def _rounded_mask(size, radius):
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return mask


def make_icon(size, split=True):
    s = size * SS
    radius = int(s * 0.235)
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle([0, 0, s - 1, s - 1], radius=radius, fill=BLUE)
    if split:
        tri = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        ImageDraw.Draw(tri).polygon(
            [(s, int(s * 0.32)), (s, s), (int(s * 0.32), s)],
            fill=PURPLE,
        )
        img = Image.alpha_composite(img, Image.composite(tri, Image.new("RGBA", (s, s), (0, 0, 0, 0)), _rounded_mask(s, radius)))
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(FONT_BOLD, int(s * 0.62))
    bbox = draw.textbbox((0, 0), "R", font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (s - tw) / 2 - bbox[0]
    ty = (s - th) / 2 - bbox[1] - s * 0.006
    draw.text((tx, ty), "R", font=font, fill=WHITE)
    return img.resize((size, size), Image.LANCZOS)


make_icon(256).save(out / "icon.png", format="PNG")
make_icon(64, split=False).save(out / "tray.png", format="PNG")
make_icon(32, split=False).save(out / "tray32.png", format="PNG")

make_icon(256).save(
    out / "icon.ico",
    format="ICO",
    sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)

print("icons written to", out)
