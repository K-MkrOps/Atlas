import React from 'react'
import { useTranslation } from 'react-i18next'

import { AssetLoader } from '@atlasfoundation/engine/src/assets/classes/AssetLoader'
import { useEngineState } from '@atlasfoundation/engine/src/ecs/classes/EngineService'
import { getComponent, hasComponent } from '@atlasfoundation/engine/src/ecs/functions/ComponentFunctions'
import { ErrorComponent } from '@atlasfoundation/engine/src/scene/components/ErrorComponent'
import { ImageComponent } from '@atlasfoundation/engine/src/scene/components/ImageComponent'
import { VideoComponent } from '@atlasfoundation/engine/src/scene/components/VideoComponent'

import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual'

import ImageInput from '../inputs/ImageInput'
import InputGroup from '../inputs/InputGroup'
import ImageSourceProperties from './ImageSourceProperties'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

export const ImageNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.node.entity
  const engineState = useEngineState()
  const imageComponent = getComponent(entity, ImageComponent)
  const hasError = engineState.errorEntities[entity].get() || hasComponent(entity, ErrorComponent)

  const updateSrc = async (src: string) => {
    AssetLoader.Cache.delete(src)
    await AssetLoader.loadAsync(src)
    updateProperty(ImageComponent, 'imageSource')(src)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.image.name')}
      description={t('editor:properties.image.description')}
    >
      {!hasComponent(entity, VideoComponent) && (
        <InputGroup name="Image Url" label={t('editor:properties.image.lbl-imgURL')}>
          <ImageInput value={imageComponent.imageSource} onChange={updateSrc} />
          {hasError && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.image.error-url')}</div>}
        </InputGroup>
      )}
      <ImageSourceProperties node={props.node} multiEdit={props.multiEdit} />
    </NodeEditor>
  )
}

ImageNodeEditor.iconComponent = PhotoSizeSelectActualIcon

export default ImageNodeEditor
