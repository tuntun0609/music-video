import { parseMedia } from '@remotion/media-parser'
import type { CalculateMetadataFunction } from 'remotion'
import { Composition, staticFile } from 'remotion'
import { Music } from './music'
import type { LyricLine } from './music/utils/srt-parser'
import { parseSRT } from './music/utils/srt-parser'

type MusicProps = {
  lyrics: LyricLine[]
}

// 计算视频时长的函数
const calculateMetadata: CalculateMetadataFunction<MusicProps> = async () => {
  const fps = 60

  // 获取音频时长(秒)
  const { slowDurationInSeconds } = await parseMedia({
    src: staticFile('誓燃山河.mp3'),
    fields: { slowDurationInSeconds: true },
  })

  // 将秒转换为帧数
  const durationInFrames = Math.ceil(slowDurationInSeconds * fps)

  // 读取并解析 SRT 文件
  const srtPath = staticFile('誓燃山河.srt')
  const srtResponse = await fetch(srtPath)
  const srtContent = await srtResponse.text()
  const lyrics = parseSRT(srtContent)

  return {
    fps,
    durationInFrames,
    props: {
      lyrics,
    },
  }
}

export const RemotionRoot = () => (
  <>
    <Composition
      calculateMetadata={calculateMetadata}
      component={Music}
      defaultProps={{
        lyrics: [],
      }}
      durationInFrames={1000}
      fps={60}
      height={1440}
      id={'music-video'}
      width={1080}
    />
  </>
)
