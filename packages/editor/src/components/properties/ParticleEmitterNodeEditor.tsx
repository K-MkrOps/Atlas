import React from 'react'
import { useTranslation } from 'react-i18next'

import * as EasingFunctions from '@atlasfoundation/engine/src/common/functions/EasingFunctions'
import { useEngineState } from '@atlasfoundation/engine/src/ecs/classes/EngineService'
import { getComponent, hasComponent } from '@atlasfoundation/engine/src/ecs/functions/ComponentFunctions'
import { ParticleEmitterComponent } from '@atlasfoundation/engine/src/particles/components/ParticleEmitter'
import { ErrorComponent } from '@atlasfoundation/engine/src/scene/components/ErrorComponent'

import GrainIcon from '@mui/icons-material/Grain'

import { camelPad } from '../../functions/utils'
import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import ImageInput from '../inputs/ImageInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

//creating object containing Curve options for SelectInput
const CurveOptions = Object.keys(EasingFunctions).map((name) => ({
  label: camelPad(name),
  value: name
}))

export const ParticleEmitterNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const engineState = useEngineState()
  const entity = props.node.entity
  const particleComponent = getComponent(entity, ParticleEmitterComponent)
  const hasError = engineState.errorEntities[entity].get() || hasComponent(entity, ErrorComponent)

  if (!particleComponent) return <></>
  return (
    <NodeEditor {...props} description={t('editor:properties.partileEmitter.description')}>
      <NumericInputGroup
        name="Particle Count"
        label={t('editor:properties.partileEmitter.lbl-particleCount')}
        min={1}
        smallStep={1}
        mediumStep={1}
        largeStep={1}
        value={particleComponent.particleCount}
        onChange={updateProperty(ParticleEmitterComponent, 'particleCount')}
      />

      <InputGroup name="Image" label={t('editor:properties.partileEmitter.lbl-image')}>
        <ImageInput value={particleComponent.src} onChange={updateProperty(ParticleEmitterComponent, 'src')} />
        {hasError && (
          <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.partileEmitter.error-url')}</div>
        )}
      </InputGroup>

      <NumericInputGroup
        name="Age Randomness"
        label={t('editor:properties.partileEmitter.lbl-ageRandomness')}
        info={t('editor:properties.partileEmitter.info-ageRandomness')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={particleComponent.ageRandomness}
        onChange={updateProperty(ParticleEmitterComponent, 'ageRandomness')}
        unit="s"
      />

      <NumericInputGroup
        name="Lifetime"
        label={t('editor:properties.partileEmitter.lbl-lifetime')}
        info={t('editor:properties.partileEmitter.info-lifetime')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={particleComponent.lifetime}
        onChange={updateProperty(ParticleEmitterComponent, 'lifetime')}
        unit="s"
      />

      <NumericInputGroup
        name="Lifetime Randomness"
        label={t('editor:properties.partileEmitter.lbl-lifetimeRandomness')}
        info={t('editor:properties.partileEmitter.info-lifetimeRandomness')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={particleComponent.lifetimeRandomness}
        onChange={updateProperty(ParticleEmitterComponent, 'lifetimeRandomness')}
        unit="s"
      />

      <InputGroup name="Size Curve" label={t('editor:properties.partileEmitter.lbl-sizeCurve')}>
        <SelectInput
          options={CurveOptions}
          value={particleComponent.sizeCurve}
          onChange={updateProperty(ParticleEmitterComponent, 'sizeCurve')}
        />
      </InputGroup>

      <NumericInputGroup
        name="Start Particle Size"
        label={t('editor:properties.partileEmitter.lbl-startPSize')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={particleComponent.startSize}
        onChange={updateProperty(ParticleEmitterComponent, 'startSize')}
        unit="m"
      />

      <NumericInputGroup
        name="End Particle Size"
        label={t('editor:properties.partileEmitter.lbl-endPSize')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={particleComponent.endSize}
        onChange={updateProperty(ParticleEmitterComponent, 'endSize')}
        unit="m"
      />

      <NumericInputGroup
        name="Size Randomness"
        label={t('editor:properties.partileEmitter.lbl-sizeRandomness')}
        info={t('editor:properties.partileEmitter.info-sizeRandomness')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={particleComponent.sizeRandomness}
        onChange={updateProperty(ParticleEmitterComponent, 'sizeRandomness')}
        unit="m"
      />

      <InputGroup name="Color Curve" label={t('editor:properties.partileEmitter.lbl-colorCurve')}>
        <SelectInput
          options={CurveOptions}
          value={particleComponent.colorCurve}
          onChange={updateProperty(ParticleEmitterComponent, 'colorCurve')}
        />
      </InputGroup>

      <InputGroup name="Start Color" label={t('editor:properties.partileEmitter.lbl-startColor')}>
        <ColorInput
          value={particleComponent.startColor}
          onChange={updateProperty(ParticleEmitterComponent, 'startColor')}
        />
      </InputGroup>

      <InputGroup name="Start Opacity" label={t('editor:properties.partileEmitter.lbl-startOpacity')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.01}
          value={particleComponent.startOpacity}
          onChange={updateProperty(ParticleEmitterComponent, 'startOpacity')}
        />
      </InputGroup>

      <InputGroup name="Middle Color" label={t('editor:properties.partileEmitter.lbl-middleColor')}>
        <ColorInput
          value={particleComponent.middleColor}
          onChange={updateProperty(ParticleEmitterComponent, 'middleColor')}
        />
      </InputGroup>

      <InputGroup name="Middle Opacity" label={t('editor:properties.partileEmitter.lbl-middleOpacity')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.01}
          value={particleComponent.middleOpacity}
          onChange={updateProperty(ParticleEmitterComponent, 'middleOpacity')}
        />
      </InputGroup>

      <InputGroup name="End Color" label={t('editor:properties.partileEmitter.lbl-endColor')}>
        <ColorInput
          value={particleComponent.endColor}
          onChange={updateProperty(ParticleEmitterComponent, 'endColor')}
        />
      </InputGroup>

      <InputGroup name="End Opacity" label={t('editor:properties.partileEmitter.lbl-endOpacity')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.01}
          value={particleComponent.endOpacity}
          onChange={updateProperty(ParticleEmitterComponent, 'endOpacity')}
        />
      </InputGroup>

      <InputGroup name="Velocity Curve" label={t('editor:properties.partileEmitter.lbl-velocityCurve')}>
        <SelectInput
          options={CurveOptions}
          value={particleComponent.velocityCurve}
          onChange={updateProperty(ParticleEmitterComponent, 'velocityCurve')}
        />
      </InputGroup>

      <InputGroup name="Start Velocity" label={t('editor:properties.partileEmitter.lbl-startVelocity')}>
        <Vector3Input
          value={particleComponent.startVelocity}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={updateProperty(ParticleEmitterComponent, 'startVelocity')}
        />
      </InputGroup>

      <InputGroup name="End Velocity" label={t('editor:properties.partileEmitter.lbl-endVelocity')}>
        <Vector3Input
          value={particleComponent.endVelocity}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={updateProperty(ParticleEmitterComponent, 'endVelocity')}
        />
      </InputGroup>

      <NumericInputGroup
        name="Angular Velocity"
        label={t('editor:properties.partileEmitter.lbl-angularVelocity')}
        min={-100}
        smallStep={1}
        mediumStep={1}
        largeStep={1}
        value={particleComponent.angularVelocity}
        onChange={updateProperty(ParticleEmitterComponent, 'angularVelocity')}
        unit="°/s"
      />
    </NodeEditor>
  )
}

ParticleEmitterNodeEditor.iconComponent = GrainIcon

export default ParticleEmitterNodeEditor
