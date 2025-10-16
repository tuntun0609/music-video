import type { LyricLine } from '../utils/srt-parser'
import { getCurrentLyric, getNextLyric } from '../utils/srt-parser'

type LyricsProps = {
  readonly currentTime: number
  readonly lyrics: LyricLine[]
}

export const Lyrics = ({ currentTime, lyrics }: LyricsProps) => {
  const currentLyric = getCurrentLyric(lyrics, currentTime)
  const nextLyric = getNextLyric(lyrics, currentTime)

  return (
    <div className="flex h-full flex-col items-center justify-center px-8">
      {/* 歌词显示区域 */}
      <div className="text-center">
        {currentLyric ? (
          <p className="mb-4 font-medium text-2xl text-gray-800">
            {currentLyric.text}
          </p>
        ) : (
          <p className="mb-4 font-medium text-2xl text-gray-400">♪</p>
        )}
        {nextLyric && (
          <p className="text-gray-600 text-lg opacity-60">{nextLyric.text}</p>
        )}
      </div>
    </div>
  )
}
