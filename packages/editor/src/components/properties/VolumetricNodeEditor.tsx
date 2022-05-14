import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { VolumetricFileTypes } from '@atlasfoundation/engine/src/assets/constants/fileTypes'
import { getComponent } from '@atlasfoundation/engine/src/ecs/functions/ComponentFunctions'
import { VolumetricComponent } from '@atlasfoundation/engine/src/scene/components/VolumetricComponent'
import { VolumetricPlayMode } from '@atlasfoundation/engine/src/scene/constants/VolumetricPlayMode'
import { toggleVolumetric } from '@atlasfoundation/engine/src/scene/functions/loaders/VolumetricFunctions'

import VideocamIcon from '@mui/icons-material/Videocam'

import { ItemTypes } from '../../constants/AssetTypes'
import ArrayInputGroup from '../inputs/ArrayInputGroup'
import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
// import AudioSourceProperties from './AudioSourceProperties'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

const PlayModeOptions = [
  {
    label: 'Single',
    value: VolumetricPlayMode.Single
  },
  {
    label: 'Random',
    value: VolumetricPlayMode.Random
  },
  {
    label: 'Loop',
    value: VolumetricPlayMode.Loop
  },
  {
    label: 'SingleLoop',
    value: VolumetricPlayMode.SingleLoop
  }
]

/**
 * VolumetricNodeEditor provides the editor view to customize properties.
 *
 * @param       {any} props
 * @constructor
 */
export const VolumetricNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const [isPlaying, setPlaying] = useState(false)

  const toggle = () => {
    setPlaying(toggleVolumetric(props.node.entity))
  }

  const volumetricComponent = getComponent(props.node.entity, VolumetricComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.volumetric.name')}
      description={t('editor:properties.volumetric.description')}
    >
      <ArrayInputGroup
        name="UVOL Paths"
        prefix="Content"
        values={volumetricComponent.paths}
        onChange={updateProperty(VolumetricComponent, 'paths')}
        label={t('editor:properties.volumetric.uvolPaths')}
        acceptFileTypes={VolumetricFileTypes}
        itemType={ItemTypes.Volumetrics}
      ></ArrayInputGroup>
      <InputGroup name="Play Mode" label={t('editor:properties.volumetric.playmode')}>
        <SelectInput
          options={PlayModeOptions}
          value={volumetricComponent.playMode}
          onChange={updateProperty(VolumetricComponent, 'playMode')}
        />
        {volumetricComponent.paths && volumetricComponent.paths.length > 0 && volumetricComponent.paths[0] && (
          <Button style={{ marginLeft: '5px', width: '60px' }} type="submit" onClick={toggle}>
            {isPlaying ? t('editor:properties.volumetric.pausetitle') : t('editor:properties.volumetric.playtitle')}
          </Button>
        )}
      </InputGroup>
    </NodeEditor>
  )
}

//setting iconComponent with icon name
VolumetricNodeEditor.iconComponent = VideocamIcon

export default VolumetricNodeEditor
