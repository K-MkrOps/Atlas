import * as React from 'react'

import { useLocationState } from '@atlasfoundation/client-core/src/social/services/LocationService'
import {
  configureMediaTransports,
  endVideoChat
} from '@atlasfoundation/client-core/src/transports/SocketWebRTCClientFunctions'
import { getMediaTransport } from '@atlasfoundation/client-core/src/transports/SocketWebRTCClientTransport'
import { useAuthState } from '@atlasfoundation/client-core/src/user/services/AuthService'
import { MediaStreams } from '@atlasfoundation/engine/src/networking/systems/MediaStreamSystem'

import { CallEnd, VideoCall } from '@mui/icons-material'
import Fab from '@mui/material/Fab'

interface Props {}

const VideoChat = (props: Props) => {
  const mediaStreamSystem = new MediaStreams()

  const user = useAuthState().user
  const currentLocation = useLocationState().currentLocation.location
  const gsProvision = async () => {
    if (mediaStreamSystem.videoStream == null) {
      let mediaTransport = getMediaTransport()
      await configureMediaTransports(mediaTransport, ['video', 'audio'])
      console.log('Send camera streams called from gsProvision')
    } else {
      await endVideoChat(null, {})
    }
  }
  return (
    <Fab color="primary" aria-label="VideoChat" onClick={gsProvision}>
      {mediaStreamSystem.videoStream == null && <VideoCall />}
      {mediaStreamSystem.videoStream != null && <CallEnd />}
    </Fab>
  )
}

export default VideoChat
