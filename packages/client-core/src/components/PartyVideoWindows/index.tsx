import { useState } from '@hoostate/core'
import React, { useEffect } from 'react'

import { useMediaInstanceConnectionState } from '@atlasfoundation/client-core/src/common/services/MediaInstanceConnectionService'
import { accessMediaStreamState } from '@atlasfoundation/client-core/src/media/services/MediaStreamService'
import { accessAuthState } from '@atlasfoundation/client-core/src/user/services/AuthService'
import { useUserState } from '@atlasfoundation/client-core/src/user/services/UserService'
import { User } from '@atlasfoundation/common/src/interfaces/User'

import PartyParticipantWindow from '../PartyParticipantWindow'

const PartyVideoWindows = (): JSX.Element => {
  const nearbyLayerUsers = useState(accessMediaStreamState().nearbyLayerUsers)
  const selfUserId = useState(accessAuthState().user.id)
  const userState = useUserState()
  const channelConnectionState = useMediaInstanceConnectionState()
  const displayedUsers =
    channelConnectionState.channelType.value === 'channel'
      ? userState.channelLayerUsers.value.filter((user) => user.id !== selfUserId.value)
      : userState.layerUsers.value.filter((user) => !!nearbyLayerUsers.value.find((u) => u.id === user.id))

  return (
    <>
      {displayedUsers.map((user) => (
        <PartyParticipantWindow peerId={user.id} key={user.id} />
      ))}
    </>
  )
}

export default PartyVideoWindows
