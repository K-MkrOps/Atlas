import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'

import {
  AVATAR_FILE_ALLOWED_EXTENSIONS,
  MAX_AVATAR_FILE_SIZE,
  MIN_AVATAR_FILE_SIZE,
  REGEX_VALID_URL,
  THUMBNAIL_FILE_ALLOWED_EXTENSIONS,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '@atlas/common/src/constants/AvatarConstants'
import { AvatarInterface } from '@atlas/common/src/interfaces/AvatarInterface'
import { AssetLoader } from '@atlas/engine/src/assets/classes/AssetLoader'
import { loadAvatarForPreview } from '@atlas/engine/src/avatar/functions/avatarFunctions'
import { Entity } from '@atlas/engine/src/ecs/classes/Entity'
import { createEntity, removeEntity } from '@atlas/engine/src/ecs/functions/EntityFunctions'
import { useWorld } from '@atlas/engine/src/ecs/functions/SystemHooks'
import { getOrbitControls } from '@atlas/engine/src/input/functions/loadOrbitControl'

import { AccountCircle, ArrowBack, CloudUpload, Help, SystemUpdateAlt } from '@mui/icons-material'
import Button from '@mui/material/Button'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

import IconLeftClick from '../../../../common/components/Icons/IconLeftClick'
import { AuthService } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { Views } from '../util'
import { addAnimationLogic, initialize3D, onWindowResize, validate } from './helperFunctions'

interface Props {
  changeActiveMenu: Function
  onAvatarUpload?: () => void
  avatarData?: AvatarInterface
  uploadAvatarModel?: Function
  isPublicAvatar?: boolean
  adminStyles?: any
}

let camera: PerspectiveCamera
let scene: Scene
let renderer: WebGLRenderer = null!
let entity: Entity = null!

const Input = styled('input')({
  display: 'none'
})

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  )
}

export const AvatarUploadModal = (props: Props) => {
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [selectedThumbnail, setSelectedThumbnail] = useState<any>(null)
  const [avatarName, setAvatarName] = useState('')
  const [error, setError] = useState('')
  const [avatarModel, setAvatarModel] = useState<any>(null)
  const [activeSourceType, setActiveSourceType] = useState(1)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [validAvatarUrl, setValidAvatarUrl] = useState(false)
  const [selectedThumbnailUrl, setSelectedThumbNailUrl] = useState<any>(null)
  const [selectedAvatarlUrl, setSelectedAvatarUrl] = useState<any>(null)
  const panelRef = useRef() as React.MutableRefObject<HTMLDivElement>

  const loadAvatarByURL = async (objectURL) => {
    try {
      const obj = await loadAvatarForPreview(entity, objectURL)
      if (!obj) {
        setAvatarModel(null!)
        setError('Failed to load')
        return
      }
      scene.add(obj)
      const error = validate(obj)
      setError(error)
      if (error === '') {
        setAvatarModel(obj)
        obj.name = 'avatar'
      }
    } catch (err) {
      console.error(err)
      setError(err)
    }
  }

  const handleChangeSourceType = (event: React.SyntheticEvent, newValue: number) => {
    setActiveSourceType(newValue)
  }

  const handleThumbnailUrlChange = (event) => {
    event.preventDefault()
    setThumbnailUrl(event.target.value)
    if (REGEX_VALID_URL.test(event.target.value)) {
      fetch(event.target.value)
        .then((res) => res.blob())
        .then((data) => setSelectedThumbNailUrl(data))
        .catch((err) => {
          setError(err.message)
        })
    }
  }

  const handleAvatarUrlChange = async (event) => {
    event.preventDefault()
    setAvatarUrl(event.target.value)
    if (/\.(?:gltf|glb|vrm)/.test(event.target.value) && REGEX_VALID_URL.test(event.target.value)) {
      setValidAvatarUrl(true)
      loadAvatarByURL(event.target.value)
      fetch(event.target.value)
        .then((res) => res.blob())
        .then((data) => setSelectedAvatarUrl(data))
        .catch((err) => {
          setError(err.message)
        })
    } else {
      setValidAvatarUrl(false)
    }
  }

  const { isPublicAvatar, changeActiveMenu, avatarData, onAvatarUpload } = props

  const [fileSelected, setFileSelected] = useState(false)

  const { t } = useTranslation()

  useEffect(() => {
    const world = useWorld()
    entity = createEntity()
    addAnimationLogic(entity, world, panelRef)
    const init = initialize3D()
    scene = init.scene
    camera = init.camera
    renderer = init.renderer
    const controls = getOrbitControls(camera, renderer.domElement)

    controls.minDistance = 0.1
    controls.maxDistance = 10
    controls.target.set(0, 1.5, 0)
    controls.update()
    window.addEventListener('resize', () => onWindowResize({ scene, camera, renderer }))

    if (avatarData) {
      loadAvatarByURL(avatarData.url)
    }

    return () => {
      removeEntity(entity)
      entity = null!
      window.removeEventListener('resize', () => onWindowResize({ scene, camera, renderer }))
    }
  }, [])

  const handleAvatarChange = (e) => {
    if (e.target.files[0].size < MIN_AVATAR_FILE_SIZE || e.target.files[0].size > MAX_AVATAR_FILE_SIZE) {
      setError(
        t('user:avatar.fileOversized', {
          minSize: MIN_AVATAR_FILE_SIZE / 1048576,
          maxSize: MAX_AVATAR_FILE_SIZE / 1048576
        })
      )
      return
    }

    scene.children = scene.children.filter((c) => c.name !== 'avatar')
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (fileData) => {
      try {
        const assetType = AssetLoader.getAssetType(file.name)
        if (assetType) {
          const objectURL = URL.createObjectURL(file) + '#' + file.name
          loadAvatarByURL(objectURL)
        }
      } catch (error) {
        console.error(error)
        setError(t('user:avatar.selectValidFile'))
      }
    }

    try {
      reader.readAsArrayBuffer(file)
      setFileSelected(true)
      setSelectedFile(e.target.files[0])
    } catch (error) {
      console.error(e)
      setError(t('user:avatar.selectValidFile'))
    }
  }

  const handleAvatarNameChange = (e) => {
    e.preventDefault()
    setAvatarName(e.target.value)
  }

  const uploadAvatar = async () => {
    if (avatarModel == null) return
    const thumbnailBlob = activeSourceType ? selectedThumbnail : selectedThumbnailUrl
    const avatarBlob = activeSourceType ? selectedFile : selectedAvatarlUrl

    if (thumbnailBlob == null) {
      await new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        ;(canvas.width = THUMBNAIL_WIDTH), (canvas.height = THUMBNAIL_HEIGHT)
        const newContext = canvas.getContext('2d')
        newContext?.drawImage(renderer.domElement, 0, 0)
        canvas.toBlob((blob) => {
          AuthService.uploadAvatarModel(avatarBlob, blob!, avatarName, isPublicAvatar).then(resolve)
        })
      })
    } else {
      await AuthService.uploadAvatarModel(avatarBlob, thumbnailBlob, avatarName, isPublicAvatar)
    }

    onAvatarUpload && onAvatarUpload()
    changeActiveMenu(Views.Profile)
  }

  const handleThumbnailChange = (e) => {
    if (e.target.files[0].size < MIN_AVATAR_FILE_SIZE || e.target.files[0].size > MAX_AVATAR_FILE_SIZE) {
      setError(
        t('user:avatar.fileOversized', {
          minSize: MIN_AVATAR_FILE_SIZE / 1048576,
          maxSize: MAX_AVATAR_FILE_SIZE / 1048576
        })
      )
      return
    }

    try {
      setSelectedThumbnail(e.target.files[0])
    } catch (error) {
      console.error(e)
      setError(t('user:avatar.selectValidThumbnail'))
    }
  }

  const openAvatarMenu = (e) => {
    e.preventDefault()
    changeActiveMenu(Views.AvatarSelect)
  }

  const uploadButtonEnabled = !!fileSelected && !error && avatarName.length > 3

  const styling = props.adminStyles || styles

  return (
    <div ref={panelRef} className={styling.avatarUploadPanel}>
      <div className={styling.avatarHeaderBlock}>
        <button type="button" className={styling.iconBlock} onClick={openAvatarMenu}>
          <ArrowBack />
        </button>
        <h2>{t('user:avatar.title')}</h2>
      </div>
      <div
        id="stage"
        className={styling.stage}
        style={{ width: THUMBNAIL_WIDTH + 'px', height: THUMBNAIL_HEIGHT + 'px' }}
      >
        <div className={styling.legendContainer}>
          <Help />
          <div className={styling.legend}>
            <div>
              <IconLeftClick />
              <br />- <span>{t('user:avatar.rotate')}</span>
            </div>
            <div>
              <span className={styling.shiftKey}>Shift</span> + <IconLeftClick />
              <br />- <span>{t('user:avatar.pan')}</span>
            </div>
          </div>
        </div>
      </div>
      {selectedThumbnail != null && (
        <div className={styling.thumbnailContainer}>
          <img
            src={URL.createObjectURL(selectedThumbnail)}
            alt={selectedThumbnail?.name}
            className={styling.thumbnailPreview}
          />
        </div>
      )}
      {thumbnailUrl.length > 0 && (
        <div className={styling.thumbnailContainer}>
          <img src={thumbnailUrl} alt="Avatar" className={styling.thumbnailPreview} />
        </div>
      )}
      <Paper className={styling.paper2}>
        <InputBase
          sx={{ ml: 1, flex: 1, color: '#fff', fontWeight: '700', fontSize: '16px' }}
          inputProps={{ 'aria-label': 'avatar url' }}
          classes={{ input: styling.input }}
          value={avatarData?.name ?? avatarName}
          disabled={!!avatarData?.name}
          id="avatarName"
          size="small"
          name="avatarname"
          onChange={handleAvatarNameChange}
          placeholder="Avatar Name"
        />
      </Paper>
      {!avatarData && (
        <>
          <div>
            <Tabs
              value={activeSourceType}
              onChange={handleChangeSourceType}
              aria-label="basic tabs example"
              classes={{ root: styling.tabRoot, indicator: styling.selected }}
            >
              <Tab
                className={activeSourceType == 0 ? styling.selectedTab : styling.unselectedTab}
                label="Use URL"
                {...a11yProps(0)}
                classes={{ root: styling.tabRoot }}
              />
              <Tab
                className={activeSourceType == 1 ? styling.selectedTab : styling.unselectedTab}
                label="Upload Files"
                {...a11yProps(1)}
              />
            </Tabs>
          </div>
          <TabPanel value={activeSourceType} index={0}>
            <div className={styling.controlContainer}>
              <div className={styling.selectBtns} style={{ margin: '14px 0' }}>
                <Paper className={styling.paper} style={{ marginRight: '8px', padding: '4px 0' }}>
                  <InputBase
                    sx={{ ml: 1, flex: 1, fontWeight: '700', fontSize: '16px' }}
                    placeholder="Paste Avatar Url..."
                    inputProps={{ 'aria-label': 'avatar url' }}
                    classes={{ input: styling.input }}
                    value={avatarUrl}
                    onChange={handleAvatarUrlChange}
                  />
                </Paper>
                <Paper className={styling.paper} style={{ padding: '4px 0' }}>
                  <InputBase
                    sx={{ ml: 1, flex: 1, fontWeight: '700', fontSize: '16px' }}
                    placeholder="Paste Thumbnail Url..."
                    inputProps={{ 'aria-label': 'thumbnail url' }}
                    classes={{ input: styling.input }}
                    value={thumbnailUrl}
                    onChange={handleThumbnailUrlChange}
                  />
                </Paper>
              </div>
              <button
                type="button"
                className={styling.uploadBtn}
                onClick={uploadAvatar}
                disabled={!validAvatarUrl}
                style={{ cursor: !validAvatarUrl ? 'not-allowed' : 'pointer' }}
              >
                {t('user:avatar.lbl-upload')}
                <CloudUpload />
              </button>
            </div>
          </TabPanel>
          <TabPanel value={activeSourceType} index={1}>
            {error.length > 0 && (
              <div className={styling.selectLabelContainer}>
                <div className={styling.avatarSelectError}>{error}</div>
              </div>
            )}
            <div className={styling.controlContainer}>
              <div className={styling.selectBtns}>
                <label htmlFor="contained-button-file" style={{ marginRight: '8px' }}>
                  <Input
                    accept={AVATAR_FILE_ALLOWED_EXTENSIONS}
                    id="contained-button-file"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    variant="contained"
                    component="span"
                    classes={{ root: styling.rootBtn }}
                    endIcon={<SystemUpdateAlt />}
                  >
                    {t('user:avatar.avatar')}
                  </Button>
                </label>
                <label htmlFor="contained-button-file-t">
                  <Input
                    accept={THUMBNAIL_FILE_ALLOWED_EXTENSIONS}
                    id="contained-button-file-t"
                    type="file"
                    onChange={handleThumbnailChange}
                  />
                  <Button
                    variant="contained"
                    component="span"
                    classes={{ root: styling.rootBtn }}
                    endIcon={<AccountCircle />}
                  >
                    {t('user:avatar.lbl-thumbnail')}
                  </Button>
                </label>
              </div>
              <button
                type="button"
                className={styling.uploadBtn}
                onClick={uploadAvatar}
                style={{ cursor: uploadButtonEnabled ? 'pointer' : 'not-allowed' }}
                disabled={!uploadButtonEnabled}
              >
                {t('user:avatar.lbl-upload')}
                <CloudUpload />
              </button>
            </div>
          </TabPanel>
        </>
      )}
    </div>
  )
}

export default AvatarUploadModal
