#!/usr/bin/env python3
"""Sinister-premium chiaroscuro grade for jay_legacy_fit stills.

Takes a real photo and applies a cinematic dark grade without any AI
regeneration: black crush + S-curve, partial desaturation, teal/warm
split-tone, an elliptical key-light falloff so the subject emerges from
shadow, local-contrast clarity, film grain, letterbox bars, and an
optional tracked-out brand mark.

Usage:
  python3 cinematic_grade.py IN.png OUT.jpg --focus 0.42,0.45 \
      --brand "JAY LEGACY" --sub "EVERYDAY HUSTLE CO." \
      [--font path/to/Display.ttf] [--letterbox 0.105] [--grain 0.012]

Focus is the subject's face/chest center as a fraction of width,height —
the key light is centered there.
"""

import argparse

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FALLBACK_FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def smoothstep(edge0, edge1, x):
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def luma(img):
    return img[..., 0] * 0.2126 + img[..., 1] * 0.7152 + img[..., 2] * 0.0722


def grade(img, focus, args):
    h, w = img.shape[:2]

    # 1. pull exposure down and crush blacks with a hard S-curve
    img = img * args.exposure
    img = np.clip(img - args.black_crush, 0, None) / (1 - args.black_crush)
    img = np.clip(img, 0, 1) ** args.gamma
    img = img * 0.75 + smoothstep(0.08, 0.92, img) * 0.25  # S-curve blend

    # 2. partial desaturation toward steel
    l = luma(img)[..., None]
    img = img * (1 - args.desat) + l * args.desat

    # 3. split-tone: cold teal shadows, restrained warm highlights
    lm = luma(img)
    shadow_w = ((1 - lm) ** 2)[..., None]
    high_w = (lm ** 2)[..., None]
    img = img + shadow_w * np.array([-0.020, 0.006, 0.034]) \
              + high_w * np.array([0.026, 0.010, -0.018])

    # 4. elliptical key light: subject lit, frame falls to near-black
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    fx, fy = focus
    dx = (xs / w - fx) / args.key_rx
    dy = (ys / h - fy) / args.key_ry
    mask = np.exp(-(dx * dx + dy * dy) * 1.35)
    light = args.edge_dark + (args.center_boost - args.edge_dark) * mask
    img = img * light[..., None]

    # 5. clarity (big-radius unsharp) to carve definition, then micro-sharpen
    pil = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    blur = pil.filter(ImageFilter.GaussianBlur(radius=w * 0.03))
    img = np.clip(
        np.asarray(pil, dtype=np.float32) / 255 * (1 + args.clarity)
        - np.asarray(blur, dtype=np.float32) / 255 * args.clarity, 0, 1)
    pil = Image.fromarray((img * 255).astype(np.uint8))
    pil = pil.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    img = np.asarray(pil, dtype=np.float32) / 255

    # 6. film grain, heavier in shadows
    rng = np.random.default_rng(1221)
    noise = rng.normal(0, args.grain, size=(h, w, 1)).astype(np.float32)
    img = np.clip(img + noise * (0.45 + 0.55 * (1 - luma(img))[..., None]), 0, 1)
    return img


def letterbox_and_brand(pil, args):
    w, h = pil.size
    draw = ImageDraw.Draw(pil, "RGBA")
    bar = int(h * args.letterbox)
    if bar:
        draw.rectangle([0, 0, w, bar], fill=(0, 0, 0, 255))
        draw.rectangle([0, h - bar, w, h], fill=(0, 0, 0, 255))
    if not args.brand:
        return pil

    def tracked(text, font, tracking):
        widths = [draw.textlength(c, font=font) for c in text]
        return widths, sum(widths) + tracking * (len(text) - 1)

    def draw_tracked(text, font, tracking, y, fill):
        widths, total = tracked(text, font, tracking)
        x = (w - total) / 2
        for c, cw in zip(text, widths):
            draw.text((x + 2, y + 3), c, font=font, fill=(0, 0, 0, 160))
            draw.text((x, y), c, font=font, fill=fill)
            x += cw + tracking

    try:
        main_font = ImageFont.truetype(args.font, int(w * 0.052))
        sub_font = ImageFont.truetype(args.font, int(w * 0.020))
    except OSError:
        main_font = ImageFont.truetype(FALLBACK_FONT, int(w * 0.045))
        sub_font = ImageFont.truetype(FALLBACK_FONT, int(w * 0.018))

    y_main = int(h * (1 - args.letterbox) - w * 0.052 - h * 0.052)
    draw_tracked(args.brand, main_font, w * 0.022, y_main, (236, 233, 227, 235))
    if args.sub:
        y_sub = y_main + int(w * 0.052) + int(h * 0.014)
        draw_tracked(args.sub, sub_font, w * 0.016, y_sub, (200, 196, 189, 190))
    return pil


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--focus", default="0.45,0.45",
                   help="face/chest center as fx,fy fractions")
    p.add_argument("--brand", default="")
    p.add_argument("--sub", default="")
    p.add_argument("--font", default=FALLBACK_FONT)
    p.add_argument("--letterbox", type=float, default=0.105)
    p.add_argument("--grain", type=float, default=0.011)
    p.add_argument("--exposure", type=float, default=0.90)
    p.add_argument("--black-crush", type=float, default=0.06)
    p.add_argument("--gamma", type=float, default=1.16)
    p.add_argument("--desat", type=float, default=0.42)
    p.add_argument("--key-rx", type=float, default=0.62,
                   help="key light x radius as fraction of width")
    p.add_argument("--key-ry", type=float, default=0.46,
                   help="key light y radius as fraction of height")
    p.add_argument("--edge-dark", type=float, default=0.16,
                   help="brightness multiplier at frame edges")
    p.add_argument("--center-boost", type=float, default=1.14,
                   help="brightness multiplier at the key center")
    p.add_argument("--clarity", type=float, default=0.28)
    args = p.parse_args()

    focus = tuple(float(v) for v in args.focus.split(","))
    src = Image.open(args.input).convert("RGB")
    img = np.asarray(src, dtype=np.float32) / 255.0
    out = Image.fromarray((grade(img, focus, args) * 255).astype(np.uint8))
    out = letterbox_and_brand(out, args)
    out.save(args.output, quality=95)
    print(f"wrote {args.output} ({out.size[0]}x{out.size[1]})")


if __name__ == "__main__":
    main()
