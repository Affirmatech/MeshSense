#!/usr/bin/env bash

set -euo pipefail

if [ -n "${DEBUG:-}" ]; then
    set -x
fi

# Script to create adaptive macOS icons for light/dark mode

ICON_DIR="macos-icons"
STYLE="${1:-regular}"

case "$STYLE" in
    "clear")
        LIGHT_ICON="meshsense-macOS-ClearLight-1024x1024@2x.png"
        DARK_ICON="meshsense-macOS-ClearDark-1024x1024@2x.png"
        OUTPUT_NAME="meshsense-clear-adaptive.icns"
        ;;
    "regular"|"default")
        LIGHT_ICON="meshsense-macOS-Default-1024x1024@2x.png"
        DARK_ICON="meshsense-macOS-Dark-1024x1024@2x.png"
        OUTPUT_NAME="meshsense-regular-adaptive.icns"
        ;;
    "tinted")
        LIGHT_ICON="meshsense-macOS-TintedLight-1024x1024@2x.png"
        DARK_ICON="meshsense-macOS-TintedDark-1024x1024@2x.png"
        OUTPUT_NAME="meshsense-tinted-adaptive.icns"
        ;;
    *)
        echo "Invalid style: $STYLE"
        echo "Valid options: clear, regular, tinted"
        echo "Usage: $0 [clear|regular|tinted]"
        exit 1
        ;;
esac

ICONSET_NAME="${OUTPUT_NAME%.icns}.iconset"

mkdir -p "$ICONSET_NAME"

resize_icon() {
    local source="$1"
    local size="$2"
    local suffix="$3"
    local appearance="$4"

    if [ ! -f "$ICON_DIR/$source" ]; then
        echo "Warning: Source file not found: $ICON_DIR/$source"
        return
    fi

    local padded_size=$((size * 81 / 100))

    sips -z "$padded_size" "$padded_size" "$ICON_DIR/$source" --out "/tmp/temp_icon.png" 2>/dev/null
    sips -p "$size" "$size" -c "$size" "$size" --padToHeightWidth "$size" "$size" "/tmp/temp_icon.png" --out "$ICONSET_NAME/icon_${size}x${size}${suffix}${appearance}.png" 2>/dev/null
    rm -f "/tmp/temp_icon.png"
}

SIZES=(16 32 64 128 256 512 1024)
SUFFIXES=("" "@2x")

generate_icons() {
    local source_icon="$1"
    local appearance="$2"

    for size in "${SIZES[@]}"; do
        for suffix in "${SUFFIXES[@]}"; do
            # we are not supposed to generate @2x for 16px
            if [ "$size" = "16" ] && [ "$suffix" = "@2x" ]; then
                continue
            fi

            resize_icon "$source_icon" "$size" "$suffix" "$appearance"
        done
    done
}


generate_icons "$LIGHT_ICON" ""
generate_icons "$DARK_ICON" "~dark"
iconutil -c icns "$ICONSET_NAME" -o "$OUTPUT_NAME"

if [ $? -eq 0 ]; then
    echo "Created $OUTPUT_NAME with light/dark mode support"
    echo "File location: $(pwd)/$OUTPUT_NAME"

    rm -rf "$ICONSET_NAME"
else
    echo "Failed to create icns file"
    exit 1
fi
