#!/bin/bash
set -euo pipefail
source_root="$(cd "$(dirname "$0")" && pwd)"
repo_root="$(cd "$source_root/../.." && pwd)"
if [[ "$(uname -s)" != Darwin ]]; then
  echo '此构建入口需要 macOS；其他系统可直接打开 web/index.html 预览。' >&2
  exit 1
fi
if [[ ! -s "$source_root/web/assets/dragon.jpg" ]]; then
  echo '请先将你有权使用的参考图保存为 web/assets/dragon.jpg，再重新构建。' >&2
  exit 1
fi
# Unique output: preserve every existing build and all upstream launchers.
build_dir="$repo_root/build/silver-wing/$(date +%Y%m%d-%H%M%S)-$$"
app="$build_dir/Codex 龙翼少女启动器.app"
mkdir -p "$build_dir"
/usr/bin/osacompile -l JavaScript -o "$app" "$source_root/launcher.js"
/usr/bin/ditto "$source_root/web" "$app/Contents/Resources/web"
/usr/bin/plutil -replace CFBundleIdentifier -string local.codex.silverwing.launcher "$app/Contents/Info.plist"
/usr/bin/plutil -replace CFBundleName -string 'Codex 龙翼少女启动器' "$app/Contents/Info.plist"
/usr/bin/plutil -replace LSMinimumSystemVersion -string 13.0 "$app/Contents/Info.plist"
/usr/bin/codesign --force --sign - "$app"
/usr/bin/codesign --verify --strict "$app"
printf '\n构建成功：%s\n双击上面的 .app 即可播放动画并打开 Codex。\n' "$app"
