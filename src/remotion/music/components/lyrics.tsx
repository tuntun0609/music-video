import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import type { LyricLine } from '../utils/srt-parser'
import {
  getCurrentLyricIndex,
  getLastPlayedLyricIndex,
} from '../utils/srt-parser'

type LyricsProps = {
  readonly currentTime: number
  readonly lyrics: LyricLine[]
}

export const Lyrics = ({ currentTime, lyrics }: LyricsProps) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 获取当前正在播放的歌词索引
  const currentIndex = getCurrentLyricIndex(lyrics, currentTime)

  // 获取最后已播放过的歌词索引(用于滚动定位,在间隔期间保持位置)
  const displayIndex = getLastPlayedLyricIndex(lyrics, currentTime)

  // 歌词行高度(增加以适应更大的字体)
  const LINE_HEIGHT = 100

  // 计算目标滚动偏移
  const targetScrollOffset =
    displayIndex === -1 ? 0 : -(displayIndex * LINE_HEIGHT + LINE_HEIGHT / 2)

  // 找到切换发生的时刻
  let transitionStartFrame = 0
  if (displayIndex >= 0 && lyrics[displayIndex]) {
    // 将歌词开始时间转换为帧数
    transitionStartFrame = Math.floor(lyrics[displayIndex].startTime * fps)
  }

  // 使用 spring 动画实现平滑过渡
  const scrollProgress = spring({
    frame: frame - transitionStartFrame,
    fps,
    config: {
      damping: 20,
      mass: 0.5,
      stiffness: 100,
    },
  })

  // 计算前一个歌词的偏移
  const prevIndex = Math.max(0, displayIndex - 1)
  const prevScrollOffset =
    prevIndex === 0 && displayIndex === -1
      ? 0
      : -(prevIndex * LINE_HEIGHT + LINE_HEIGHT / 2)

  // 使用 spring 进度在前一个位置和当前位置之间插值
  const scrollOffset = interpolate(
    scrollProgress,
    [0, 1],
    [prevScrollOffset, targetScrollOffset],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  )

  return (
    <div className="relative h-full w-full overflow-hidden px-8 py-12">
      {/* 歌词容器 - 使用绝对定位确保居中且不超出 */}
      <div
        className="absolute right-8 left-8 w-auto"
        style={{
          top: '50%',
          transform: `translateY(${scrollOffset}px)`,
        }}
      >
        {lyrics.map((lyric, idx) => {
          // 判断是否为当前正在播放的歌词
          // 如果没有歌词正在播放(间隔期间),则高亮最后播放的歌词
          const isCurrentLyric =
            currentIndex === -1 ? idx === displayIndex : idx === currentIndex

          // 计算该行歌词的动画起始帧
          const lyricStartFrame = Math.floor(lyric.startTime * fps)

          // 使用 spring 实现平滑的缩放动画
          const scaleSpring = spring({
            frame: frame - lyricStartFrame,
            fps,
            config: {
              damping: 15,
              mass: 0.3,
              stiffness: 120,
            },
          })

          const scale = isCurrentLyric
            ? interpolate(scaleSpring, [0, 1], [1, 1.2], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            : 1

          // 使用 spring 实现平滑的透明度过渡
          const opacitySpring = spring({
            frame: frame - lyricStartFrame,
            fps,
            config: {
              damping: 12,
              mass: 0.2,
              stiffness: 150,
            },
          })

          const opacity = isCurrentLyric
            ? interpolate(opacitySpring, [0, 1], [0.5, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            : 0.5

          return (
            <div
              className="flex items-center justify-center text-center"
              key={lyric.index}
              style={{
                height: `${LINE_HEIGHT}px`,
                opacity,
                transform: `scale(${scale})`,
                willChange: 'transform, opacity',
              }}
            >
              <p
                className="font-bold leading-relaxed"
                style={{
                  fontSize: '2.5rem',
                  color: '#ffffff',
                }}
              >
                {lyric.text}
              </p>
            </div>
          )
        })}

        {/* 当没有歌词时显示音乐符号 */}
        {lyrics.length === 0 && (
          <div
            className="flex items-center justify-center text-center"
            style={{ height: `${LINE_HEIGHT}px` }}
          >
            <p className="text-4xl text-gray-400">♪</p>
          </div>
        )}
      </div>
    </div>
  )
}
