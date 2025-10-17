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
  extractDominantHue,
  generateColorScheme,
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

  // 从封面提取的颜色配置
  const [colorScheme, setColorScheme] = useState({
    colors: [
      { hue: 5, saturation: 75, lightness: 82 },
      { hue: 12, saturation: 80, lightness: 78 },
      { hue: 0, saturation: 70, lightness: 85 },
    ],
  })

  // 提取封面颜色
  useEffect(() => {
    const loadColorScheme = async () => {
      try {
        const coverUrl = staticFile(coverPath)
        const { hue } = await extractDominantHue(coverUrl)
        const scheme = generateColorScheme(hue)
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
          hsl(${colorScheme.colors[0].hue}, ${colorScheme.colors[0].saturation}%, ${colorScheme.colors[0].lightness}%), 
          hsl(${colorScheme.colors[1].hue}, ${colorScheme.colors[1].saturation}%, ${colorScheme.colors[1].lightness}%),
          hsl(${colorScheme.colors[2].hue}, ${colorScheme.colors[2].saturation}%, ${colorScheme.colors[2].lightness}%))`,
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
