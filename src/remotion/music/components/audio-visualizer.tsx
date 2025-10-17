import { useAudioData, visualizeAudio } from '@remotion/media-utils'
import {
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

type AudioVisualizerProps = {
  readonly color?: string
  readonly barCount?: number
  readonly style?: 'bars' | 'circle' | 'wave'
  readonly audioSrc?: string
}

export const AudioVisualizer = ({
  color = '#ffffff',
  barCount = 64,
  style = 'bars',
  audioSrc = staticFile('誓燃山河.mp3'),
}: AudioVisualizerProps) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()

  // 验证 barCount 是否为 2 的幂次方
  const isPowerOfTwo = (n: number) => {
    if (n <= 0) {
      return false
    }
    // 使用对数判断: log2(n) 应该是整数
    return Math.log2(n) % 1 === 0
  }
  if (!isPowerOfTwo(barCount)) {
    throw new Error(
      `barCount must be a power of two (e.g., 32, 64, 128, 256). Got: ${barCount}`
    )
  }

  // 加载音频数据
  const audioData = useAudioData(audioSrc)

  // 如果音频数据还未加载完成,返回 null
  if (!audioData) {
    return null
  }

  // 使用 Remotion 的 visualizeAudio API 获取当前帧的音频频谱
  const visualization = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: barCount,
  })

  // 获取每个条形的高度(已经是 0-1 之间的值)
  const getBarHeight = (index: number) => visualization[index] || 0

  // 条形可视化
  if (style === 'bars') {
    const barWidth = width / barCount
    const maxBarHeight = height * 0.6

    return (
      <div
        className="absolute bottom-0 left-0 flex items-end justify-center gap-1"
        style={{
          width: '100%',
          height: maxBarHeight,
        }}
      >
        {Array.from({ length: barCount }).map((_, index) => {
          const heightRatio = getBarHeight(index)
          const barHeight = interpolate(
            heightRatio,
            [0, 1],
            [20, maxBarHeight],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          )

          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <OvO>
              key={index}
              style={{
                width: barWidth - 2,
                height: barHeight,
                backgroundColor: color,
                opacity: 0.6 + heightRatio * 0.4,
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.1s ease-out',
              }}
            />
          )
        })}
      </div>
    )
  }

  // 圆形可视化
  if (style === 'circle') {
    const centerX = width / 2
    const centerY = height / 2
    const baseRadius = Math.min(width, height) * 0.25
    const maxAmplitude = 80

    return (
      <svg className="absolute inset-0" height={height} width={width}>
        <title>Audio Visualizer</title>
        <g>
          {/* 绘制圆形波形 */}
          {Array.from({ length: barCount }).map((_, index) => {
            const angle = (index / barCount) * Math.PI * 2
            const heightRatio = getBarHeight(index)
            const amplitude = heightRatio * maxAmplitude
            const radius = baseRadius + amplitude

            const x1 = centerX + Math.cos(angle) * baseRadius
            const y1 = centerY + Math.sin(angle) * baseRadius
            const x2 = centerX + Math.cos(angle) * radius
            const y2 = centerY + Math.sin(angle) * radius

            return (
              <line
                // biome-ignore lint/suspicious/noArrayIndexKey: <OvO>
                key={index}
                opacity={0.6 + heightRatio * 0.4}
                stroke={color}
                strokeLinecap="round"
                strokeWidth="3"
                x1={x1}
                x2={x2}
                y1={y1}
                y2={y2}
              />
            )
          })}
          {/* 中心圆 */}
          <circle
            cx={centerX}
            cy={centerY}
            fill="none"
            opacity={0.3}
            r={baseRadius}
            stroke={color}
            strokeWidth="2"
          />
        </g>
      </svg>
    )
  }

  // 波形可视化
  if (style === 'wave') {
    const centerY = height / 2
    const points: string[] = []
    const step = width / barCount

    for (let i = 0; i <= barCount; i++) {
      const x = i * step
      const heightRatio = getBarHeight(i)
      const amplitude = interpolate(
        heightRatio,
        [0, 1],
        [-height * 0.1, height * 0.1]
      )
      const y = centerY + amplitude
      points.push(`${x},${y}`)
    }

    return (
      <svg className="absolute inset-0" height={height} width={width}>
        <title>Audio Visualizer</title>
        {/* 主波形 */}
        <polyline
          fill="none"
          opacity={0.8}
          points={points.join(' ')}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        {/* 镜像波形(创建对称效果) */}
        <polyline
          fill="none"
          opacity={0.4}
          points={points
            .map((point) => {
              const [x, y] = point.split(',').map(Number)
              return `${x},${centerY - (y - centerY)}`
            })
            .join(' ')}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        {/* 中心线 */}
        <line
          opacity={0.2}
          stroke={color}
          strokeDasharray="5,5"
          strokeWidth="1"
          x1={0}
          x2={width}
          y1={centerY}
          y2={centerY}
        />
      </svg>
    )
  }

  return null
}
