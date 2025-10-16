import { parseMedia } from '@remotion/media-parser'
import type { CalculateMetadataFunction } from 'remotion'
import { Composition, staticFile } from 'remotion'
import { Music } from './music'

// 计算视频时长的函数
const calculateMetadata: CalculateMetadataFunction<
  Record<string, unknown>
> = async () => {
  const fps = 60

  // 获取音频时长(秒)
  const { slowDurationInSeconds } = await parseMedia({
    src: staticFile('誓燃山河.mp3'),
    fields: { slowDurationInSeconds: true },
  })

  // 将秒转换为帧数
  const durationInFrames = Math.ceil(slowDurationInSeconds * fps)

  return {
    fps,
    durationInFrames,
    props: {},
  }
}

export const RemotionRoot = () => (
  <>
    <Composition
      calculateMetadata={calculateMetadata}
      component={Music}
      defaultProps={{}}
      durationInFrames={1000}
      fps={60}
      height={1440}
      id={'music-video'}
      width={1080}
    />
  </>
)
