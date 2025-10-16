type LyricsProps = {
  readonly currentTime: number
}

export const Lyrics = ({ currentTime: _currentTime }: LyricsProps) => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8">
      {/* 歌词显示区域占位 */}
      <div className="text-center">
        <p className="mb-4 font-medium text-2xl text-gray-800">
          当前歌词行占位
        </p>
        <p className="text-gray-500 text-lg">下一行歌词占位</p>
      </div>
    </div>
  )
}
