# 音乐视频生成器

这是一个基于 [Remotion](https://www.remotion.dev/) 和 [Next.js](https://nextjs.org) 的音乐视频生成项目，可以为歌曲自动生成带有歌词同步的精美视频。

## 功能特点

- 🎵 自动同步歌词显示
- 🎨 从封面图自动提取颜色方案
- 💿 旋转唱片动画效果
- 📊 音频可视化效果
- 🎬 完全可定制的参数

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 准备素材

将以下文件放入 `public/` 目录：

1. **音频文件**：`.mp3` 格式的歌曲文件
2. **封面图片**：`.png` 或 `.jpg` 格式的封面图
3. **歌词文件**：`.srt` 格式的字幕文件

### 配置视频参数

编辑 `src/remotion/root.tsx` 文件中的 `defaultProps`：

```typescript
defaultProps={{
  lyrics: [],
  coverPath: 'cover.png',        // 封面图片路径（相对于 public/ 目录）
  audioPath: '誓燃山河.mp3',      // 音频文件路径（相对于 public/ 目录）
  srtPath: '誓燃山河.srt',        // 歌词文件路径（相对于 public/ 目录）
  songTitle: '誓燃山河',          // 歌曲标题
}}
```

### 预览视频

启动 Remotion Studio：

```bash
pnpm remotion:preview
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 即可实时预览视频效果。

### 渲染视频

渲染最终视频：

```bash
pnpm remotion:render
```

渲染完成后，视频会保存在 `out/music-video.mp4`。

## 命令行参数

你也可以通过命令行参数来指定不同的歌曲：

```bash
npx remotion render music-video out/output.mp4 \
  --props='{"coverPath":"my-cover.png","audioPath":"my-song.mp3","srtPath":"my-lyrics.srt","songTitle":"我的歌曲"}'
```

## SRT 字幕格式

歌词文件需要使用标准的 SRT 格式：

```srt
1
00:00:00,000 --> 00:00:03,500
第一句歌词

2
00:00:03,500 --> 00:00:07,000
第二句歌词
```

## 自定义样式

- 视频尺寸：1080x1440（竖屏格式）
- 帧率：60 FPS
- 字体：马善政楷书（中文毛笔字体）

可以在 `src/remotion/root.tsx` 中修改这些参数。

## 项目结构

```
src/remotion/
├── root.tsx                      # Remotion 入口和配置
├── music/
│   ├── index.tsx                 # 主视频组件
│   ├── components/
│   │   ├── audio-visualizer.tsx  # 音频可视化组件
│   │   ├── lyrics.tsx            # 歌词显示组件
│   │   └── vinyl-record.tsx      # 唱片动画组件
│   └── utils/
│       ├── color-extractor.ts    # 颜色提取工具
│       └── srt-parser.ts         # SRT 解析工具
```

## 技术栈

- [Remotion](https://www.remotion.dev/) - 用 React 生成视频
- [Next.js](https://nextjs.org) - React 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Biome](https://biomejs.dev/) - 代码格式化和检查
