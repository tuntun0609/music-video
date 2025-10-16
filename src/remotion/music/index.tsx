import { useVideoConfig } from 'remotion'

import './index.css'

export const Music = () => {
  const { durationInFrames, fps } = useVideoConfig()
  console.log(durationInFrames, fps)

  return (
    <div className="h-full w-full bg-white">
      <div className="text-6xl">Music</div>
    </div>
  )
}
