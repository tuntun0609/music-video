import { parseMedia } from '@remotion/media-parser'
import type { CalculateMetadataFunction } from 'remotion'
import { Composition, staticFile } from 'remotion'
import { Music } from './music'
import type { LyricLine } from './music/utils/srt-parser'
import { parseSRT } from './music/utils/srt-parser'

export type MusicProps = {
  lyrics: LyricLine[]
  coverPath: string
  audioPath: string
  srtPath: string
  songTitle: string
}

// 计算视频时长的函数
const calculateMetadata: CalculateMetadataFunction<MusicProps> = async ({
  props,
}) => {
  const fps = 60

  // 获取音频时长(秒)
  const { slowDurationInSeconds } = await parseMedia({
    src: staticFile(props.audioPath),
    fields: { slowDurationInSeconds: true },
  })

  // 将秒转换为帧数
  const durationInFrames = Math.ceil(slowDurationInSeconds * fps)

  // 读取并解析 SRT 文件
  const srtFilePath = staticFile(props.srtPath)
  const srtResponse = await fetch(srtFilePath)
  const srtContent = await srtResponse.text()
  const lyrics = parseSRT(srtContent)

  return {
    fps,
    durationInFrames,
    props: {
      ...props,
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
        coverPath: 'Crownless.png',
        audioPath: 'Crownless.mp3',
        srtPath: 'Crownless.srt',
        songTitle: 'Crownless',
      }}
      durationInFrames={1000}
      fps={60}
      height={1440}
      id={'Crownless'}
      width={1080}
    />
  </>
)
