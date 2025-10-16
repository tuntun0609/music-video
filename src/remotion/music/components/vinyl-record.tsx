import { Img, staticFile, useVideoConfig } from 'remotion'

type VinylRecordProps = {
  readonly frame: number
}

export const VinylRecord = ({ frame }: VinylRecordProps) => {
  const { width } = useVideoConfig()

  // 根据帧数计算旋转角度,持续旋转
  const rotation = frame * 0.5 // 每帧旋转2度,可以调整旋转速度

  // 唱片尺寸为视频宽度的二分之一
  const recordSize = width / 2

  return (
    <div className="flex h-full items-center justify-center">
      <div
        className="relative"
        style={{
          width: recordSize,
          height: recordSize,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {/* 使用 cover.png 作为唱片封面,外围添加淡黑色边框 */}
        <Img
          alt="Album Cover"
          className="h-full w-full rounded-full object-cover"
          src={staticFile('cover.png')}
          style={{
            border: '28px solid rgba(0, 0, 0, 0.1)',
          }}
        />
      </div>
    </div>
  )
}
