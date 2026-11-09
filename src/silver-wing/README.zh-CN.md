# 银发龙翼少女 · Mac 优先开发版

此模块新增于 `src/silver-wing/`，保留原项目全部 Windows、Swift macOS、原视频、配置和登录监视器功能，不改 main、不自动部署、不安装监视器。

## 原项目检查结果

- `macos/`：Swift 5.9 / macOS 13+，AppKit + AVKit，通过配置控制视频与交接时间。`scripts/build-macos.sh` 以本机架构构建。可选监视器只在 Codex 新进程启动时触发，已运行应用再次激活不会重播。
- `src/macos/`：独立 AppKit + AVFoundation 版，`scripts/build-macos-standalone.sh` 明确编译 arm64，适合 M1。无需额外运行时。
- `media/startup.mp4`：约 14 秒、1920×1080 / 24 fps、带音轨，原配置 11.3 秒等待，12.7–13.65 秒淡出。原视频保留。
- 本模块提供单独的免费 WebKit / SVG / CSS / JS 动画入口。没有把原来的 14 秒视频假称为八秒新动画。

## 第一步：直接看动画（Mac，不需要编程）

1. 在 Finder 打开仓库中的 `src/silver-wing/web` 文件夹。
2. 将你有权使用的参考原画保存到 `assets/dragon.jpg`。当前本机副本已放好对话中的原画。
3. 右键 `index.html` →「打开方式」→ Safari。
4. 等待八秒：柔光淡入 → 呼吸眨眼 → 双翼/尾巴/粒子 → 微笑与 CODEX → 助手页面。
5. 点击少女触发模拟眨眼与挥手；点击重播可重新开始。
6. 若开启了“减少动态效果”，会直接进入静态助手页，可用右上角选项调整。

该预览是本地文件，不提供或虚构公网网址；“进入 Codex”在浏览器里提供网页版链接。

## 第二步：制作 M1 可用的启动器

不需要 Xcode、Swift、Node 或付费 API。构建使用 macOS 自带的 JXA / osacompile，窗口由 AppKit 和系统 WebKit 提供。

1. 打开 Mac 的「终端」。
2. 输入 `bash `（后面有一个空格）。
3. 把 `src/silver-wing/build.command` 从 Finder 拖入终端，再按回车。
4. 等待出现“构建成功”，按输出路径在 Finder 找到 `Codex 龙翼少女启动器.app`。
5. 双击它：动画结束后按应用标识 `com.openai.codex` 查找并打开官方客户端，然后退出启动器。支持应用已经在运行的情况。
6. 将这个 .app 拖到 Dock 左侧应用区域，以后点击新入口启动。

输出在 `build/silver-wing/日期时间-进程号/`，每次生成新目录，不覆盖任何旧应用。构建有本机 ad-hoc 签名，没有 Apple 公证；如被系统阻止，请保留提示，不关闭系统安全保护。

动画中可点“进入 Codex”立即交接；重播将等待新一轮结束；关窗口或 Command+Q 取消。减少动态模式会跳过动画。原应用、Dock、登录项及其他仓库都不受修改。直接点官方入口或通知不会播放本模块动画。

## iPhone / iPad 预览

移动端支持网页预览，不运行 Mac .app。将整个 `web` 文件夹放在自己可访问的静态预览环境即可，或在 Mac 装有 Node 时：

```sh
node src/silver-wing/preview.mjs
```

终端打印真实的局域网地址。手机和 Mac 连接同一可信 Wi-Fi，在 Safari 输入打印的地址。Mac 保持运行；服务只提供 web 目录，不包含 Git 数据。停止：终端 Ctrl+C。无需公网部署。电脑 VPN 或 Wi-Fi 隔离可能阻止设备互访。

## 动效精度和素材

严格使用用户参考图，不生成或换脸。SVG 裁切原画做轻幅二维变换：整体呼吸、局部发梢/裙摆、翼展、尾摆、前臂挥动；眨眼/微笑用局部覆盖线模拟。保留原画背景并混合页面，运动边缘可能有接缝。没有真实骨骼、头发物理或高质量逐帧补画，不声称达到动画电影质量。

本地参考图依上游 CONTRIBUTING.md 保持不提交；代码不替角色素材追加授权。下载源码后需要自行放入原画。

## 验证

```sh
node src/silver-wing/check.mjs
```

测试八秒切换、重播定时器清理、互动、减少动态、对话框。构建后使用 `codesign --verify --strict 路径` 校验。原 Swift 功能未修改，其现有检查仍由 `swift test --package-path macos` / `scripts/test-macos.sh` / `scripts/test-macos-standalone.sh` 负责；需要 Xcode Command Line Tools。
