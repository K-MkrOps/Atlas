import React, { useEffect, useState } from 'react'

import { VrIcon } from '@atlasfoundation/client-core/src/common/components/Icons/Vricon'
import { useLocationInstanceConnectionState } from '@atlasfoundation/client-core/src/common/services/LocationInstanceConnectionService'
import {
  MediaInstanceConnectionService,
  useMediaInstanceConnectionState
} from '@atlasfoundation/client-core/src/common/services/MediaInstanceConnectionService'
import { MediaStreamService, useMediaStreamState } from '@atlasfoundation/client-core/src/media/services/MediaStreamService'
import { useChatState } from '@atlasfoundation/client-core/src/social/services/ChatService'
import { useLocationState } from '@atlasfoundation/client-core/src/social/services/LocationService'
import {
  configureMediaTransports,
  createCamAudioProducer,
  createCamVideoProducer,
  endVideoChat,
  leave,
  pauseProducer,
  resumeProducer
} from '@atlasfoundation/client-core/src/transports/SocketWebRTCClientFunctions'
import { getMediaTransport } from '@atlasfoundation/client-core/src/transports/SocketWebRTCClientTransport'
import { useAuthState } from '@atlasfoundation/client-core/src/user/services/AuthService'
import { Engine } from '@atlasfoundation/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@atlasfoundation/engine/src/ecs/classes/EngineService'
import {
  startFaceTracking,
  startLipsyncTracking,
  stopFaceTracking,
  stopLipsyncTracking
} from '@atlasfoundation/engine/src/input/functions/WebcamInput'
import { MediaStreams } from '@atlasfoundation/engine/src/networking/systems/MediaStreamSystem'
import { dispatchAction } from '@atlasfoundation/hyperflux'

import { Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material'
import FaceIcon from '@mui/icons-material/Face'

import styles from './index.module.scss'

interface Props {
  animate?: any
}
const MediaIconsBox = (props: Props) => {
  const [hasAudioDevice, setHasAudioDevice] = useState(false)
  const [hasVideoDevice, setHasVideoDevice] = useState(false)

  const user = useAuthState().user
  const chatState = useChatState()
  const instanceId = useLocationInstanceConnectionState().instance.id.value
  const channelState = chatState.channels
  const channels = channelState.channels.value
  const channelEntries = Object.values(channels).filter((channel) => !!channel) as any
  const instanceChannel = channelEntries.find((entry) => entry.instanceId === instanceId)
  const currentLocation = useLocationState().currentLocation.location
  const channelConnectionState = useMediaInstanceConnectionState()
  const mediastream = useMediaStreamState()
  const videoEnabled = currentLocation?.locationSetting?.value
    ? currentLocation?.locationSetting?.videoEnabled?.value
    : false
  const instanceMediaChatEnabled = currentLocation?.locationSetting?.value
    ? currentLocation?.locationSetting?.instanceMediaChatEnabled?.value
    : false

  const isFaceTrackingEnabled = mediastream.isFaceTrackingEnabled
  const isCamVideoEnabled = mediastream.isCamVideoEnabled
  const isCamAudioEnabled = mediastream.isCamAudioEnabled

  const engineState = useEngineState()

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          if (device.kind === 'audioinput') setHasAudioDevice(true)
          if (device.kind === 'videoinput') setHasVideoDevice(true)
        })
      })
      .catch((err) => console.log('could not get media devices', err))
  }, [])

  const handleFaceClick = async () => {
    const partyId =
      currentLocation?.locationSetting?.instanceMediaChatEnabled?.value === true
        ? 'instance'
        : user.partyId?.value || 'instance'
    if (isFaceTrackingEnabled.value) {
      MediaStreams.instance.setFaceTracking(false)
      stopFaceTracking()
      stopLipsyncTracking()
      MediaStreamService.updateFaceTrackingState()
    } else {
      const mediaTransport = getMediaTransport()
      if (await configureMediaTransports(mediaTransport, ['video', 'audio'])) {
        MediaStreams.instance.setFaceTracking(true)
        startFaceTracking()
        startLipsyncTracking()
        MediaStreamService.updateFaceTrackingState()
      }
    }
  }

  const checkEndVideoChat = async () => {
    const mediaTransport = getMediaTransport()
    if (
      (MediaStreams.instance.audioPaused || MediaStreams.instance?.camAudioProducer == null) &&
      (MediaStreams.instance.videoPaused || MediaStreams.instance?.camVideoProducer == null) &&
      instanceChannel.channelType !== 'instance'
    ) {
      await endVideoChat(mediaTransport, {})
      if (mediaTransport.socket?.connected === true) {
        await leave(mediaTransport, false)
        await MediaInstanceConnectionService.provisionServer(instanceChannel.id)
      }
    }
  }
  const handleMicClick = async () => {
    const mediaTransport = getMediaTransport()
    if (await configureMediaTransports(mediaTransport, ['audio'])) {
      if (MediaStreams.instance?.camAudioProducer == null) await createCamAudioProducer(mediaTransport)
      else {
        const audioPaused = MediaStreams.instance.toggleAudioPaused()
        if (audioPaused) await pauseProducer(mediaTransport, MediaStreams.instance.camAudioProducer)
        else await resumeProducer(mediaTransport, MediaStreams.instance.camAudioProducer)
        checkEndVideoChat()
      }
      MediaStreamService.updateCamAudioState()
    }
  }

  const handleCamClick = async () => {
    const mediaTransport = getMediaTransport()
    if (await configureMediaTransports(mediaTransport, ['video'])) {
      if (MediaStreams.instance?.camVideoProducer == null) await createCamVideoProducer(mediaTransport)
      else {
        const videoPaused = MediaStreams.instance.toggleVideoPaused()
        if (videoPaused) await pauseProducer(mediaTransport, MediaStreams.instance.camVideoProducer)
        else await resumeProducer(mediaTransport, MediaStreams.instance.camVideoProducer)
        checkEndVideoChat()
      }

      MediaStreamService.updateCamVideoState()
    }
  }

  const handleVRClick = () => dispatchAction(Engine.instance.store, EngineActions.xrStart())

  const VideocamIcon = isCamVideoEnabled.value ? Videocam : VideocamOff
  const MicIcon = isCamAudioEnabled.value ? Mic : MicOff

  return (
    <section className={`${styles.drawerBox} ${props.animate}`}>
      {instanceMediaChatEnabled && hasAudioDevice && channelConnectionState.connected.value === true ? (
        <button
          type="button"
          id="UserAudio"
          className={styles.iconContainer + ' ' + (isCamAudioEnabled.value ? styles.on : '')}
          onClick={handleMicClick}
        >
          <MicIcon />
        </button>
      ) : null}
      {videoEnabled && hasVideoDevice && channelConnectionState.connected.value === true ? (
        <>
          <button
            type="button"
            id="UserVideo"
            className={styles.iconContainer + ' ' + (isCamVideoEnabled.value ? styles.on : '')}
            onClick={handleCamClick}
          >
            <VideocamIcon />
          </button>
          {
            <button
              type="button"
              id="UserFaceTracking"
              className={styles.iconContainer + ' ' + (isFaceTrackingEnabled.value ? styles.on : '')}
              onClick={handleFaceClick}
            >
              <FaceIcon />
            </button>
          }
        </>
      ) : null}
      {engineState.xrSupported.value ? (
        <button type="button" id="UserXR" className={styles.iconContainer} onClick={handleVRClick}>
          <VrIcon />
        </button>
      ) : null}
    </section>
  )
}

export default MediaIconsBox
