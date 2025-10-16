type VinylRecordProps = {
  readonly frame: number
}

export const VinylRecord = ({ frame }: VinylRecordProps) => {
  // 根据帧数计算旋转角度
  const rotation = frame * 2 // 可以调整旋转速度

  return (
    <div className="flex h-full items-center justify-center">
      <div
        className="relative"
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {/* 唱片外观占位 */}
        <div className="h-64 w-64 rounded-full border-8 border-gray-800 bg-black">
          {/* 唱片中心 */}
          <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-16 w-16 transform rounded-full border-4 border-gray-700 bg-gray-900" />
        </div>
      </div>
    </div>
  )
}
