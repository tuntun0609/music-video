import { useCurrentFrame, useVideoConfig } from 'remotion'

import { Lyrics } from './components/lyrics'
import { VinylRecord } from './components/vinyl-record'
import './index.css'

export const Music = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 计算当前时间(秒)
  const currentTime = frame / fps

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-purple-100 to-pink-100">
      {/* 唱片区域 - 占据上半部分 */}
      <div className="flex flex-1 items-center justify-center">
        <VinylRecord frame={frame} />
      </div>

      {/* 歌词区域 - 占据下半部分 */}
      <div className="flex-1">
        <Lyrics currentTime={currentTime} />
      </div>
    </div>
  )
}
