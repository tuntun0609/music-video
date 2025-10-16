import { useEffect, useState } from 'react'
import {
  Html5Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

import { Lyrics } from './components/lyrics'
import { VinylRecord } from './components/vinyl-record'
import './index.css'
import {
  extractDominantHue,
  generateColorScheme,
} from './utils/color-extractor'
import type { LyricLine } from './utils/srt-parser'

type MusicProps = {
  lyrics: LyricLine[]
}

export const Music = ({ lyrics }: MusicProps) => {
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
        const coverUrl = staticFile('cover.png')
        const { hue } = await extractDominantHue(coverUrl)
        const scheme = generateColorScheme(hue)
        setColorScheme(scheme)
      } catch (error) {
        console.error('Failed to extract colors from cover:', error)
        // 保持默认颜色方案
      }
    }

    loadColorScheme()
  }, [])

  return (
    <div
      className="flex h-full w-full flex-col p-12"
      style={{
        background: `linear-gradient(135deg, 
          hsl(${colorScheme.colors[0].hue}, ${colorScheme.colors[0].saturation}%, ${colorScheme.colors[0].lightness}%), 
          hsl(${colorScheme.colors[1].hue}, ${colorScheme.colors[1].saturation}%, ${colorScheme.colors[1].lightness}%),
          hsl(${colorScheme.colors[2].hue}, ${colorScheme.colors[2].saturation}%, ${colorScheme.colors[2].lightness}%))`,
      }}
    >
      {/* 音频 */}
      <Html5Audio src={staticFile('誓燃山河.mp3')} />

      {/* 唱片区域 - 主视觉焦点 */}
      <div className="flex flex-[2.5] items-center justify-center">
        <VinylRecord frame={frame} />
      </div>

      {/* 歌曲名字 - 适中大小 */}
      <div className="flex flex-[0.8] items-center justify-center py-4">
        <h1
          className="font-bold text-white tracking-wider"
          style={{
            fontSize: '4rem',
            letterSpacing: '0.15em',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          誓燃山河
        </h1>
      </div>

      {/* 歌词区域 - 次要信息 */}
      <div className="flex-[1.8] pt-2">
        <Lyrics currentTime={currentTime} lyrics={lyrics} />
      </div>
    </div>
  )
}
