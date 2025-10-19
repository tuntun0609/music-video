import { loadFont } from '@remotion/google-fonts/MaShanZheng'
import { useEffect, useState } from 'react'
import {
  Html5Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

import { AudioVisualizer } from './components/audio-visualizer'
import { Lyrics } from './components/lyrics'
import { VinylRecord } from './components/vinyl-record'
import './index.css'
import {
  extractDominantColor,
  generateColorScheme,
  type RGBColor,
  rgbToString,
} from './utils/color-extractor'
import type { LyricLine } from './utils/srt-parser'

// 加载中文毛笔字体 - 马善政楷书(更易读)
const { fontFamily } = loadFont()

type MusicProps = {
  lyrics: LyricLine[]
  coverPath: string
  audioPath: string
  srtPath: string
  songTitle: string
}

export const Music = ({
  lyrics,
  coverPath,
  audioPath,
  songTitle,
}: MusicProps) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 计算当前时间(秒)
  const currentTime = frame / fps

  // 从封面提取的颜色配置（使用 RGB）
  const [colorScheme, setColorScheme] = useState<{ colors: RGBColor[] }>({
    colors: [
      { r: 220, g: 180, b: 200 },
      { r: 200, g: 160, b: 180 },
      { r: 240, g: 200, b: 220 },
    ],
  })

  // 提取封面颜色
  useEffect(() => {
    const loadColorScheme = async () => {
      try {
        const coverUrl = staticFile(coverPath)
        const dominantColor = await extractDominantColor(coverUrl)
        console.log('提取的主色调:', dominantColor)
        const scheme = generateColorScheme(dominantColor)
        console.log('生成的配色方案:', scheme)
        setColorScheme(scheme)
      } catch (error) {
        console.error('Failed to extract colors from cover:', error)
        // 保持默认颜色方案
      }
    }

    loadColorScheme()
  }, [coverPath])

  return (
    <div
      className="relative flex h-full w-full flex-col"
      style={{
        background: `linear-gradient(135deg, 
          ${rgbToString(colorScheme.colors[0])}, 
          ${rgbToString(colorScheme.colors[1])},
          ${rgbToString(colorScheme.colors[2])})`,
      }}
    >
      <div className="relative flex h-full w-full flex-col p-12">
        {/* 音频 */}
        <Html5Audio src={staticFile(audioPath)} />

        {/* 唱片区域 - 主视觉焦点 */}
        <div className="relative flex flex-[2] items-center justify-center">
          <VinylRecord coverPath={coverPath} frame={frame} />
        </div>

        {/* 歌曲名字 - 突出显示 */}
        <div className="flex flex-[0.6] items-center justify-center">
          <h1
            className="font-bold text-shadow-lg text-white tracking-wider"
            style={{
              fontSize: '5.5rem',
              letterSpacing: '0.2em',
              fontFamily,
            }}
          >
            {songTitle}
          </h1>
        </div>

        {/* 歌词区域 - 次要信息 */}
        <div className="relative flex-[1.8] pt-2">
          <Lyrics
            currentTime={currentTime}
            fontFamily={fontFamily}
            lyrics={lyrics}
          />
        </div>
      </div>
      {/* 唱片周围的圆形可视化 - 唯一的音频可视化效果 */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <AudioVisualizer
          barCount={64}
          color="#ffffff"
          maxHeight={0.3}
          smoothing={1}
          style="bars"
          timeSmoothing={0.85}
        />
      </div>
    </div>
  )
}
