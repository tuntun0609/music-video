import { Composition } from 'remotion'
import { Music } from './music'

export const RemotionRoot = () => (
  <>
    <Composition
      component={Music}
      defaultProps={{}}
      durationInFrames={100}
      fps={30}
      height={1440}
      id={'music-video'}
      width={1080}
    />
  </>
)
