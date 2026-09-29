"""Generate the FLOWSTATE favicon set from the brand logo.

Source art: client/public/FS_Icon_Black_Web.png (the wide "FS" mark, transparent
background). The mark is cropped to its glyph bounds, centred on a square canvas
so it survives being squashed into a browser tab, and exported at the sizes
browsers actually request.

Run from the client/ directory (Pillow required):

    python scripts/generate-favicons.py

Outputs land in client/public/ and are committed, so this only needs re-running
when the logo art changes.
"""

from pathlib import Path
import argparse

from PIL import Image

# --- Tunables -------------------------------------------------------------

# Mark width as a fraction of the square canvas. The logo is landscape
# (roughly 1.5:1), so it is fitted by width and centred vertically. Near-full
# width: at 16px the narrow stroke gaps only survive if the mark gets the pixels.
FAVICON_MARK_SCALE = 0.96
# iOS masks the corners of the home-screen icon, so it gets more breathing room.
APPLE_TOUCH_MARK_SCALE = 0.72

FAVICON_SIZES = (16, 32)
ICO_SIZES = (16, 32, 48, 64)
APPLE_TOUCH_SIZE = 180

# The mark is near-black (#231F20) in the source art. Browser chrome follows the
# OS colour scheme, so a dark-mode (light glyph) variant is generated too — the
# site ships a dark theme, and a black glyph would vanish on a dark tab bar.
DARK_MODE_GLYPH = (245, 245, 245, 255)  # --text-primary in the dark mono theme
APPLE_TOUCH_TILE = (255, 255, 255, 255)

# Supersample factor: geometry is laid out large, then downscaled, which keeps
# the slanted stroke edges clean at 16px.
SUPERSAMPLE = 4

DEFAULT_SOURCE = "public/FS_Icon_Black_Web.png"
PUBLIC_DIR = "public"


# --- Helpers --------------------------------------------------------------


def load_glyph(source: Path) -> Image.Image:
    """Return the logo as RGBA cropped tight to its visible glyph."""
    image = Image.open(source).convert("RGBA")
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError(f"{source} has no visible pixels to build an icon from")
    return image.crop(bbox)


def recolor(glyph: Image.Image, rgba) -> Image.Image:
    """Flatten the glyph to a single colour while keeping its alpha (antialiasing)."""
    flat = Image.new("RGBA", glyph.size, rgba)
    flat.putalpha(glyph.getchannel("A"))
    return flat


def render_square(glyph: Image.Image, size: int, mark_scale: float,
                  background=None) -> Image.Image:
    """Centre the glyph on a `size` x `size` canvas, drawn at SUPERSAMPLE scale."""
    big = size * SUPERSAMPLE
    mark_w = max(1, round(big * mark_scale))
    mark_h = max(1, round(mark_w * glyph.height / glyph.width))

    canvas = Image.new("RGBA", (big, big), background or (0, 0, 0, 0))
    canvas.alpha_composite(
        glyph.resize((mark_w, mark_h), Image.Resampling.LANCZOS),
        ((big - mark_w) // 2, (big - mark_h) // 2),
    )
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def save_png(image: Image.Image, path: Path) -> None:
    image.save(path, format="PNG", optimize=True)
    print(f"  {path.name:<28} {image.size[0]}x{image.size[1]}")


# --- Main -----------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", default=DEFAULT_SOURCE,
                        help=f"logo PNG to read (default: {DEFAULT_SOURCE})")
    parser.add_argument("--out", default=PUBLIC_DIR,
                        help=f"directory to write icons into (default: {PUBLIC_DIR})")
    args = parser.parse_args()

    source = Path(args.source)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Source: {source}")
    glyph = load_glyph(source)
    print(f"  glyph bounds: {glyph.size[0]}x{glyph.size[1]} (aspect "
          f"{glyph.width / glyph.height:.2f}:1)")
    light = glyph
    dark = recolor(glyph, DARK_MODE_GLYPH)

    print("Writing:")

    # Multi-size .ico for legacy requests / Windows shells. Largest frame first.
    ico_sizes = sorted(ICO_SIZES)
    ico_frames = [render_square(light, s, FAVICON_MARK_SCALE) for s in ico_sizes]
    ico_path = out_dir / "favicon.ico"
    ico_frames[-1].save(
        ico_path,
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_frames[:-1],
    )
    print(f"  {ico_path.name:<28} " + ", ".join(f"{s}x{s}" for s in ico_sizes))

    for size in FAVICON_SIZES:
        save_png(render_square(light, size, FAVICON_MARK_SCALE),
                 out_dir / f"favicon-{size}x{size}.png")
        save_png(render_square(dark, size, FAVICON_MARK_SCALE),
                 out_dir / f"favicon-{size}x{size}-dark.png")

    # iOS ignores transparency, so this one gets an opaque tile.
    save_png(render_square(light, APPLE_TOUCH_SIZE, APPLE_TOUCH_MARK_SCALE,
                           background=APPLE_TOUCH_TILE),
             out_dir / "apple-touch-icon.png")

    print("Done.")


if __name__ == "__main__":
    main()
