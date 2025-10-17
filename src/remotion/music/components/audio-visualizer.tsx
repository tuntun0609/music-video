import { useAudioData, visualizeAudio } from '@remotion/media-utils'
import React from 'react'
import {
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

type AudioVisualizerProps = {
  readonly color?: string
  readonly barCount?: number
  readonly style?: 'bars' | 'circle' | 'wave'
  readonly audioSrc?: string
  readonly smoothing?: number
  readonly maxHeight?: number // 波形最高高度，相对于视频高度的比例
  readonly timeSmoothing?: number // 时间平滑系数，值越大变化越慢 (0-1)，默认 0.7
}

export const AudioVisualizer = ({
  color = '#ffffff',
  barCount = 32,
  style = 'bars',
  audioSrc = staticFile('誓燃山河.mp3'),
  smoothing = 0.5,
  maxHeight = 0.8,
  timeSmoothing = 0.7,
}: AudioVisualizerProps) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()

  // 使用状态来存储上一帧的值，实现时间平滑（必须在所有条件判断之前）
  const previousValues = React.useRef<number[]>(new Array(barCount).fill(0))

  // 验证 barCount 是否为 2 的幂次方
  const isPowerOfTwo = (n: number) => {
    if (n <= 0) {
      return false
    }
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

  // 获取每个条形的高度并进行对数缩放以增强视觉效果
  const getBarHeight = (index: number) => {
    const rawValue = visualization[index] || 0

    // 应用空间平滑处理（相邻条形）
    const spatialSmoothing = smoothing * 0.3
    const spatialSmoothedValue =
      spatialSmoothing > 0
        ? rawValue * (1 - spatialSmoothing) +
          (visualization[Math.max(0, index - 1)] || 0) * spatialSmoothing
        : rawValue

    // 应用时间平滑处理（帧间过渡）
    const prevValue = previousValues.current[index] || 0
    const timeSmoothedValue =
      prevValue * timeSmoothing + spatialSmoothedValue * (1 - timeSmoothing)

    // 保存当前值供下一帧使用
    previousValues.current[index] = timeSmoothedValue

    // 使用更激进的指数缩放增强视觉效果
    return timeSmoothedValue ** 0.5
  }

  // 条形可视化
  if (style === 'bars') {
    const barWidth = Math.max(2, (width - barCount * 2) / barCount)
    const gapWidth = 2
    const maxBarHeight = height * maxHeight // 使用参数控制最大高度

    return (
      <div
        className="absolute bottom-0 left-0 flex items-end justify-center"
        style={{
          width: '100%',
          height: '100%',
          gap: `${gapWidth}px`,
        }}
      >
        {Array.from({ length: barCount }).map((_, index) => {
          const heightRatio = getBarHeight(index)

          // 使用更激进的映射使视觉效果更明显
          const barHeight = interpolate(
            heightRatio,
            [0, 1],
            [maxBarHeight * 0.02, maxBarHeight], // 降低最小高度，增加对比度
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          )

          // 移除弹性动画效果，让变化更平滑稳定

          // 创建镜像效果 - 中间高两边低（减弱效果，让实际音频数据更明显）
          const mirrorFactor =
            1 - Math.abs(index - barCount / 2) / (barCount / 2)
          const enhancedHeight = barHeight * (0.85 + mirrorFactor * 0.15)

          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <OvO>
              key={index}
              style={{
                width: barWidth,
                height: enhancedHeight,
                backgroundColor: color,
                opacity: 0.5 + heightRatio * 0.5,
                borderRadius: '3px 3px 0 0',
                boxShadow: `0 0 ${10 * heightRatio}px ${color}`,
                transformOrigin: 'bottom',
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
    const baseRadius = Math.min(width, height) * 0.2
    const maxAmplitude = Math.min(width, height) * 0.15

    // 添加整体脉动效果
    const pulsate = spring({
      frame: frame % 30,
      fps,
      config: {
        damping: 10,
        stiffness: 200,
        mass: 0.5,
      },
    })

    return (
      <svg className="absolute inset-0" height={height} width={width}>
        <title>Audio Visualizer</title>
        <defs>
          {/* 添加渐变效果 */}
          <radialGradient id="circleGradient">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </radialGradient>
          {/* 添加发光滤镜 */}
          <filter id="glow">
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="3" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g>
          {/* 绘制圆形波形 */}
          {Array.from({ length: barCount }).map((_, index) => {
            const angle = (index / barCount) * Math.PI * 2
            const heightRatio = getBarHeight(index)
            const amplitude = interpolate(
              heightRatio,
              [0, 1],
              [0, maxAmplitude],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }
            )
            const radius = baseRadius + amplitude + pulsate * 5

            const x1 = centerX + Math.cos(angle) * (baseRadius * 0.95)
            const y1 = centerY + Math.sin(angle) * (baseRadius * 0.95)
            const x2 = centerX + Math.cos(angle) * radius
            const y2 = centerY + Math.sin(angle) * radius

            return (
              <line
                filter="url(#glow)"
                // biome-ignore lint/suspicious/noArrayIndexKey: <OvO>
                key={index}
                opacity={0.5 + heightRatio * 0.5}
                stroke={color}
                strokeLinecap="round"
                strokeWidth={interpolate(heightRatio, [0, 1], [2, 4])}
                x1={x1}
                x2={x2}
                y1={y1}
                y2={y2}
              />
            )
          })}
          {/* 中心圆 - 带有脉动效果 */}
          <circle
            cx={centerX}
            cy={centerY}
            fill="url(#circleGradient)"
            opacity={0.4}
            r={baseRadius * 0.9 + pulsate * 5}
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
    const maxAmplitude = height * 0.25

    // 生成平滑的波形点
    for (let i = 0; i <= barCount; i++) {
      const x = i * step
      const heightRatio = getBarHeight(i)
      // 反转映射：振幅大时接近中心，振幅小时远离中心
      const amplitude = interpolate(heightRatio, [0, 1], [maxAmplitude, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
      // 上半部分波形：从上边缘向中心收缩
      const y = centerY - amplitude
      points.push(`${x},${y}`)
    }

    // 创建填充路径
    const fillPath = `
      M 0,${centerY}
      ${points.map((p) => `L ${p}`).join(' ')}
      L ${width},${centerY}
      Z
    `

    return (
      <svg className="absolute inset-0" height={height} width={width}>
        <title>Audio Visualizer</title>
        <defs>
          {/* 波形渐变 */}
          <linearGradient id="waveGradient" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="50%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
          {/* 发光效果 */}
          <filter id="waveGlow">
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="2" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 填充区域 */}
        <path d={fillPath} fill="url(#waveGradient)" opacity={0.4} />

        {/* 主波形 */}
        <polyline
          fill="none"
          filter="url(#waveGlow)"
          opacity={0.9}
          points={points.join(' ')}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />

        {/* 镜像波形(创建对称效果) */}
        <polyline
          fill="none"
          opacity={0.5}
          points={points
            .map((point) => {
              const [x, y] = point.split(',').map(Number)
              // 镜像到中心线下方
              return `${x},${centerY + (centerY - y)}`
            })
            .join(' ')}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />

        {/* 镜像填充 */}
        <path
          d={`
            M 0,${centerY}
            ${points
              .map((point) => {
                const [x, y] = point.split(',').map(Number)
                return `L ${x},${centerY + (centerY - y)}`
              })
              .join(' ')}
            L ${width},${centerY}
            Z
          `}
          fill="url(#waveGradient)"
          opacity={0.2}
        />

        {/* 中心线 */}
        <line
          opacity={0.3}
          stroke={color}
          strokeDasharray="10,5"
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
