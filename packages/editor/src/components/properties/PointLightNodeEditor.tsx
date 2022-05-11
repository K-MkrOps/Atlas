import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@atlas/engine/src/ecs/functions/ComponentFunctions'
import { PointLightComponent } from '@atlas/engine/src/scene/components/PointLightComponent'

import LightbulbIcon from '@mui/icons-material/Lightbulb'

import ColorInput from '../inputs/ColorInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import LightShadowProperties from './LightShadowProperties'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

export const PointLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const lightComponent = getComponent(props.node.entity, PointLightComponent)

  return (
    <NodeEditor {...props} description={t('editor:properties.pointLight.description')}>
      <InputGroup name="Color" label={t('editor:properties.pointLight.lbl-color')}>
        <ColorInput value={lightComponent.color} onChange={updateProperty(PointLightComponent, 'color')} />
      </InputGroup>
      <NumericInputGroup
        name="Intensity"
        label={t('editor:properties.pointLight.lbl-intensity')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={lightComponent.intensity}
        onChange={updateProperty(PointLightComponent, 'intensity')}
        unit="cd"
      />
      <NumericInputGroup
        name="Range"
        label={t('editor:properties.pointLight.lbl-range')}
        min={0}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={lightComponent.range}
        onChange={updateProperty(PointLightComponent, 'range')}
        unit="m"
      />
      <NumericInputGroup
        name="Decay"
        label={t('editor:properties.pointLight.lbl-decay')}
        min={0}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={lightComponent.decay}
        onChange={updateProperty(PointLightComponent, 'decay')}
      />
      <LightShadowProperties node={props.node} comp={PointLightComponent} />
    </NodeEditor>
  )
}

PointLightNodeEditor.iconComponent = LightbulbIcon

export default PointLightNodeEditor
