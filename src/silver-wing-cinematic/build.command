#!/bin/bash
set -euo pipefail
src="$(cd "$(dirname "$0")" && pwd)"
repo="$(cd "$src/../.." && pwd)"
[[ "$(uname -s)" == Darwin ]] || { echo '需要 macOS'; exit 1; }
[[ -s "$src/web/assets/dragon.jpg" ]] || { echo '缺少原画 assets/dragon.jpg'; exit 1; }
out="$repo/build/silver-wing-cinematic/$(date +%Y%m%d-%H%M%S)-$$"
app="$out/龙翼少女-镜头转场预览.app"
mkdir -p "$out"
/usr/bin/osacompile -l JavaScript -o "$app" "$src/launcher.js"
/usr/bin/ditto "$src/web" "$app/Contents/Resources/web"
if [[ -s "$src/web/assets/motion.mp4" ]]; then
 printf 'window.CINEMATIC_HAS_VIDEO=true;\n' > "$app/Contents/Resources/web/config.js"
fi
mkdir -p "$app/Contents/Resources/Notices"
cp "$repo/LICENSE" "$repo/THIRD_PARTY_NOTICES.md" "$app/Contents/Resources/Notices/"
cp "$src/README.zh-CN.md" "$app/Contents/Resources/Notices/"
if [[ -f "$repo/media/MEDIA_NOTICE.md" ]]; then
 cp "$repo/media/MEDIA_NOTICE.md" "$app/Contents/Resources/Notices/"
fi
/usr/bin/plutil -replace CFBundleIdentifier -string local.codex.silverwing.cinematic "$app/Contents/Info.plist"
/usr/bin/plutil -replace CFBundleName -string '龙翼少女-镜头转场预览' "$app/Contents/Info.plist"
/usr/bin/plutil -replace LSMinimumSystemVersion -string 13.0 "$app/Contents/Info.plist"
/usr/bin/codesign --force --sign - "$app"
/usr/bin/codesign --verify --strict "$app"
printf '生成：%s\n' "$app"
