import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three'

import {
  MAX_ALLOWED_TRIANGLES,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '@atlasfoundation/common/src/constants/AvatarConstants'
import { AssetLoader } from '@atlasfoundation/engine/src/assets/classes/AssetLoader'
import { loadAvatarForPreview } from '@atlasfoundation/engine/src/avatar/functions/avatarFunctions'
import { Entity } from '@atlasfoundation/engine/src/ecs/classes/Entity'
import { createEntity, removeEntity } from '@atlasfoundation/engine/src/ecs/functions/EntityFunctions'
import { useWorld } from '@atlasfoundation/engine/src/ecs/functions/SystemHooks'
import { getOrbitControls } from '@atlasfoundation/engine/src/input/functions/loadOrbitControl'
import { OrbitControls } from '@atlasfoundation/engine/src/input/functions/OrbitControls'

import { ArrowBack, Check, Help } from '@mui/icons-material'
import CircularProgress from '@mui/material/CircularProgress'

import IconLeftClick from '../../../../common/components/Icons/IconLeftClick'
import { AuthService } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { Views } from '../util'
import { addAnimationLogic, initialize3D, onWindowResize, validate } from './helperFunctions'

interface Props {
  changeActiveMenu: Function
  uploadAvatarModel?: Function
  isPublicAvatar?: boolean
}

let scene: Scene
let camera: PerspectiveCamera
let renderer: WebGLRenderer = null!

export const ReadyPlayerMenu = (props: Props) => {
  const { t } = useTranslation()

  const { isPublicAvatar, changeActiveMenu } = props
  const [selectedFile, setSelectedFile] = useState<Blob>()
  const [avatarName, setAvatarName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [hover, setHover] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [error, setError] = useState('')
  const [obj, setObj] = useState<any>(null)
  const [entity, setEntity] = useState<Entity | undefined>()
  const panelRef = useRef() as React.MutableRefObject<HTMLDivElement>

  useEffect(() => {
    const world = useWorld()
    const entity = createEntity()
    setEntity(entity)
    addAnimationLogic(entity, world, panelRef)
    const init = initialize3D()
    scene = init.scene
    camera = init.camera
    renderer = init.renderer
    const controls = getOrbitControls(camera, renderer.domElement)
    controls.minDistance = 0.1
    controls.maxDistance = 10
    controls.target.set(0, 1.25, 0)
    controls.update()

    window.addEventListener('resize', () => onWindowResize({ scene, camera, renderer }))
    window.addEventListener('message', (event) => handleMessageEvent(event, entity))

    return () => {
      window.removeEventListener('resize', () => onWindowResize({ camera, renderer, scene }))
      window.removeEventListener('message', (event) => handleMessageEvent(event, entity))
    }
  }, [avatarUrl])

  const handleMessageEvent = async (event, entity) => {
    const url = event.data
    setShowLoading(false)
    if (url != null && url.toString().toLowerCase().startsWith('http')) {
      setShowLoading(true)
      setAvatarUrl(url)
      try {
        const assetType = AssetLoader.getAssetType(url)
        if (assetType) {
          loadAvatarForPreview(entity, url).then((obj) => {
            obj.name = 'avatar'
            scene.add(obj)
            const error = validate(obj)
            setError(error)
            setObj(obj)
          })
          setShowLoading(false)
          fetch(avatarUrl)
            .then((res) => res.blob())
            .then((data) => setSelectedFile(data))
            .catch((err) => {
              setError(err.message)
              console.log(err.message)
            })
        }
      } catch (error) {
        console.error(error)
        setError(t('user:usermenu.avatar.selectValidFile'))
      }
    }
  }

  const openProfileMenu = (e) => {
    e.preventDefault()
    changeActiveMenu(Views.Profile)
  }

  const closeMenu = (e) => {
    e.preventDefault()
    changeActiveMenu(null)
    uploadAvatar()
  }

  const uploadAvatar = () => {
    if (error || selectedFile === undefined) {
      return
    }

    const canvas = document.createElement('canvas')
    ;(canvas.width = THUMBNAIL_WIDTH), (canvas.height = THUMBNAIL_HEIGHT)

    const newContext = canvas.getContext('2d')
    newContext?.drawImage(renderer.domElement, THUMBNAIL_WIDTH / 2 - THUMBNAIL_WIDTH, 0)

    var thumbnailName = avatarUrl.substring(0, avatarUrl.lastIndexOf('.')) + '.png'

    canvas.toBlob(async (blob) => {
      await AuthService.uploadAvatarModel(selectedFile, new File([blob!], thumbnailName), avatarName, isPublicAvatar)
      changeActiveMenu(Views.Profile)
    })
  }

  return (
    <div
      ref={panelRef}
      className={styles.ReadyPlayerPanel}
      style={{ width: selectedFile ? '400px' : '600px', padding: selectedFile ? '100px 0' : '0' }}
    >
      {selectedFile && (
        <section className={styles.controlContainer}>
          <div className={styles.actionBlock}>
            <button
              type="button"
              className={styles.iconBlock}
              style={{
                borderRadius: '50%',
                height: '40px',
                width: '40px',
                background: 'transparent'
              }}
              onClick={openProfileMenu}
            >
              <ArrowBack />
            </button>
          </div>
        </section>
      )}
      {!avatarUrl && (
        <iframe
          style={{ width: '100%', height: '100%' }}
          src={`${globalThis.process.env['VITE_READY_PLAYER_ME_URL']}`}
        />
      )}
      <div
        id="stage"
        className={styles.stage}
        style={{
          width: THUMBNAIL_WIDTH + 'px',
          height: THUMBNAIL_HEIGHT + 'px',
          margin: 'auto',
          display: !avatarUrl ? 'none' : 'block'
        }}
      ></div>
      {selectedFile && (
        <button
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          type="button"
          className={styles.iconBlock}
          style={{
            color: hover ? '#fff' : '#5f5ff1',
            position: 'absolute',
            top: '90%',
            left: '45%',
            border: 'none',
            borderRadius: '50%',
            height: '50px',
            width: '50px',
            background: hover ? '#5f5ff1' : '#fff'
          }}
          onClick={closeMenu}
        >
          <Check />
        </button>
      )}
      {showLoading && <CircularProgress style={{ position: 'absolute', top: '50%', left: '46%' }} />}
    </div>
  )
}

export default ReadyPlayerMenu
