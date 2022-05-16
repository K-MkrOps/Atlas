import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  CineonToneMapping,
  LinearToneMapping,
  NoToneMapping,
  PCFShadowMap,
  PCFSoftShadowMap,
  ReinhardToneMapping,
  VSMShadowMap
} from 'three'

import { DistanceModel, DistanceModelOptions } from '@atlasfoundation/engine/src/audio/constants/AudioConstants'
import { getComponent, hasComponent } from '@atlasfoundation/engine/src/ecs/functions/ComponentFunctions'
import { PositionalAudioSettingsComponent } from '@atlasfoundation/engine/src/scene/components/AudioSettingsComponent'
import { FogComponent } from '@atlasfoundation/engine/src/scene/components/FogComponent'
import { MetaDataComponent } from '@atlasfoundation/engine/src/scene/components/MetaDataComponent'
import { RenderSettingComponent } from '@atlasfoundation/engine/src/scene/components/RenderSettingComponent'
import { SimpleMaterialTagComponent } from '@atlasfoundation/engine/src/scene/components/SimpleMaterialTagComponent'
import { FogType } from '@atlasfoundation/engine/src/scene/constants/FogType'
import { SCENE_COMPONENT_SIMPLE_MATERIALS } from '@atlasfoundation/engine/src/scene/functions/loaders/SimpleMaterialFunctions'

import LanguageIcon from '@mui/icons-material/Language'

import { executeCommandWithHistoryOnSelection } from '../../classes/History'
import { TagComponentOperation } from '../../commands/TagComponentCommand'
import EditorCommands from '../../constants/EditorCommands'
import BooleanInput from '../inputs/BooleanInput'
import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import Vector3Input from '../inputs/Vector3Input'
import EnvMapEditor from './EnvMapEditor'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * FogTypeOptions array containing fogType options.
 *
 * @type {Array}
 */
const FogTypeOptions = [
  {
    label: 'Disabled',
    value: FogType.Disabled
  },
  {
    label: 'Linear',
    value: FogType.Linear
  },
  {
    label: 'Exponential',
    value: FogType.Exponential
  }
]

/**
 * ToneMappingOptions array containing tone mapping type options.
 *
 * @type {Array}
 */
const ToneMappingOptions = [
  {
    label: 'No Tone Mapping',
    value: NoToneMapping
  },
  {
    label: 'Linear Tone Mapping',
    value: LinearToneMapping
  },
  {
    label: 'Reinhard Tone Mapping',
    value: ReinhardToneMapping
  },
  {
    label: 'Cineon Tone Mapping',
    value: CineonToneMapping
  },
  {
    label: 'ACES Filmic Tone Mapping',
    value: ACESFilmicToneMapping
  }
]

/**
 * ShadowTypeOptions array containing shadow type options.
 *
 * @type {Array}
 */
const ShadowTypeOptions = [
  {
    label: 'No Shadow Map',
    value: undefined
  },
  {
    label: 'Basic Shadow Map',
    value: BasicShadowMap
  },
  {
    label: 'PCF Shadow Map',
    value: PCFShadowMap
  },
  {
    label: 'PCF Soft Shadow Map',
    value: PCFSoftShadowMap
  },
  {
    label: 'VSM Shadow Map',
    value: VSMShadowMap
  }
]

/**
 * SceneNodeEditor provides the editor view for property customization.
 *
 * @param       props
 * @constructor
 */
export const SceneNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.node.entity

  const onChangeUseSimpleMaterials = useCallback((value) => {
    executeCommandWithHistoryOnSelection(EditorCommands.TAG_COMPONENT, {
      operation: {
        component: SimpleMaterialTagComponent,
        sceneComponentName: SCENE_COMPONENT_SIMPLE_MATERIALS,
        type: value ? TagComponentOperation.ADD : TagComponentOperation.REMOVE
      }
    })
  }, [])

  const metadata = getComponent(entity, MetaDataComponent)
  const fogComponent = getComponent(entity, FogComponent)
  const audioComponent = getComponent(entity, PositionalAudioSettingsComponent)
  const renderSettingComponent = getComponent(entity, RenderSettingComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.scene.name')}
      description={t('editor:properties.scene.description')}
    >
      <InputGroup name="Metadata" label="Metadata">
        <StringInput value={metadata.meta_data} onChange={updateProperty(MetaDataComponent, 'meta_data')} />
      </InputGroup>
      <EnvMapEditor node={props.node} />
      <InputGroup name="Fog Type" label={t('editor:properties.scene.lbl-fogType')}>
        <SelectInput
          options={FogTypeOptions}
          value={fogComponent.type}
          onChange={updateProperty(FogComponent, 'type')}
        />
      </InputGroup>
      {fogComponent.type !== FogType.Disabled && (
        <InputGroup name="Fog Color" label={t('editor:properties.scene.lbl-fogColor')}>
          <ColorInput value={fogComponent.color} onChange={updateProperty(FogComponent, 'color')} />
        </InputGroup>
      )}
      {fogComponent.type === FogType.Linear && (
        <>
          <NumericInputGroup
            name="Fog Near Distance"
            label={t('editor:properties.scene.lbl-forNearDistance')}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            min={0}
            value={fogComponent.near}
            onChange={updateProperty(FogComponent, 'near')}
          />
          <NumericInputGroup
            name="Fog Far Distance"
            label={t('editor:properties.scene.lbl-fogFarDistance')}
            smallStep={1}
            mediumStep={100}
            largeStep={1000}
            min={0}
            value={fogComponent.far}
            onChange={updateProperty(FogComponent, 'far')}
          />
        </>
      )}
      {fogComponent.type === FogType.Exponential && (
        <NumericInputGroup
          name="Fog Density"
          label={t('editor:properties.scene.lbl-fogDensity')}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={0.25}
          min={0}
          value={fogComponent.density}
          onChange={updateProperty(FogComponent, 'density')}
        />
      )}
      <InputGroup name="Override Audio Settings" label={t('editor:properties.scene.lbl-audioSettings')}>
        <BooleanInput
          value={audioComponent.usePositionalAudio}
          onChange={updateProperty(PositionalAudioSettingsComponent, 'usePositionalAudio')}
        />
      </InputGroup>
      {audioComponent.usePositionalAudio && (
        <>
          <InputGroup
            name="Avatar Distance Model"
            label={t('editor:properties.scene.lbl-avatarDistanceModel')}
            info={t('editor:properties.scene.info-avatarDistanceModel')}
          >
            <SelectInput
              options={DistanceModelOptions}
              value={audioComponent.avatarDistanceModel}
              onChange={updateProperty(PositionalAudioSettingsComponent, 'avatarDistanceModel')}
            />
          </InputGroup>

          {audioComponent.avatarDistanceModel === DistanceModel.Linear ? (
            <InputGroup
              name="Avatar Rolloff Factor"
              label={t('editor:properties.scene.lbl-avatarRolloffFactor')}
              info={t('editor:properties.scene.info-avatarRolloffFactor')}
            >
              <CompoundNumericInput
                min={0}
                max={1}
                smallStep={0.001}
                mediumStep={0.01}
                largeStep={0.1}
                value={audioComponent.avatarRolloffFactor}
                onChange={updateProperty(PositionalAudioSettingsComponent, 'avatarRolloffFactor')}
              />
            </InputGroup>
          ) : (
            <NumericInputGroup
              name="Avatar Rolloff Factor"
              label={t('editor:properties.scene.lbl-avatarRolloffFactor')}
              info={t('editor:properties.scene.info-avatarRolloffFactorInifinity')}
              min={0}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={audioComponent.avatarRolloffFactor}
              onChange={updateProperty(PositionalAudioSettingsComponent, 'avatarRolloffFactor')}
            />
          )}
          <NumericInputGroup
            name="Avatar Ref Distance"
            label={t('editor:properties.scene.lbl-avatarRefDistance')}
            info={t('editor:properties.scene.info-avatarRefDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.avatarRefDistance}
            onChange={updateProperty(PositionalAudioSettingsComponent, 'avatarRefDistance')}
            unit="m"
          />
          <NumericInputGroup
            name="Avatar Max Distance"
            label={t('editor:properties.scene.lbl-avatarMaxDistance')}
            info={t('editor:properties.scene.info-avatarMaxDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.avatarMaxDistance}
            onChange={updateProperty(PositionalAudioSettingsComponent, 'avatarMaxDistance')}
            unit="m"
          />
          <InputGroup name="Media Volume" label={t('editor:properties.scene.lbl-mediaVolume')}>
            <CompoundNumericInput
              value={audioComponent.mediaVolume}
              onChange={updateProperty(PositionalAudioSettingsComponent, 'mediaVolume')}
            />
          </InputGroup>
          <InputGroup
            name="Media Distance Model"
            label={t('editor:properties.scene.lbl-mediaDistanceModel')}
            info={t('editor:properties.scene.info-mediaDistanceModel')}
          >
            <SelectInput
              options={DistanceModelOptions}
              value={audioComponent.mediaDistanceModel}
              onChange={updateProperty(PositionalAudioSettingsComponent, 'mediaDistanceModel')}
            />
          </InputGroup>

          {audioComponent.mediaDistanceModel === DistanceModel.Linear ? (
            <InputGroup
              name="Media Rolloff Factor"
              label={t('editor:properties.scene.lbl-mediaRolloffFactor')}
              info={t('editor:properties.scene.info-mediaRolloffFactor')}
            >
              <CompoundNumericInput
                min={0}
                max={1}
                smallStep={0.001}
                mediumStep={0.01}
                largeStep={0.1}
                value={audioComponent.mediaRolloffFactor}
                onChange={updateProperty(PositionalAudioSettingsComponent, 'mediaRolloffFactor')}
              />
            </InputGroup>
          ) : (
            <NumericInputGroup
              name="Media Rolloff Factor"
              label={t('editor:properties.scene.lbl-mediaRolloffFactor')}
              info={t('editor:properties.scene.info-mediaRolloffFactorInfinity')}
              min={0}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={audioComponent.mediaRolloffFactor}
              onChange={updateProperty(PositionalAudioSettingsComponent, 'mediaRolloffFactor')}
            />
          )}
          <NumericInputGroup
            name="Media Ref Distance"
            label={t('editor:properties.scene.lbl-mediaRefDistance')}
            info={t('editor:properties.scene.info-mediaRefDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.mediaRefDistance}
            onChange={updateProperty(PositionalAudioSettingsComponent, 'mediaRefDistance')}
            unit="m"
          />
          <NumericInputGroup
            name="Media Max Distance"
            label={t('editor:properties.scene.lbl-mediaMaxDistance')}
            info={t('editor:properties.scene.info-mediaMaxDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.mediaMaxDistance}
            onChange={updateProperty(PositionalAudioSettingsComponent, 'mediaMaxDistance')}
            unit="m"
          />
          <NumericInputGroup
            name="Media Cone Inner Angle"
            label={t('editor:properties.scene.lbl-mediaConeInnerAngle')}
            info={t('editor:properties.scene.info-mediaConeInnerAngle')}
            min={0}
            max={360}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.mediaConeInnerAngle}
            onChange={updateProperty(PositionalAudioSettingsComponent, 'mediaConeInnerAngle')}
            unit="°"
          />
          <NumericInputGroup
            name="Media Cone Outer Angle"
            label={t('editor:properties.scene.lbl-mediaConeOuterAngle')}
            info={t('editor:properties.scene.info-mediaConeOuterAngle')}
            min={0}
            max={360}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.mediaConeOuterAngle}
            onChange={updateProperty(PositionalAudioSettingsComponent, 'mediaConeOuterAngle')}
            unit="°"
          />
          <InputGroup
            name="Media Cone Outer Gain"
            label={t('editor:properties.scene.lbl-mediaConeOuterGain')}
            info={t('editor:properties.scene.info-mediaConeOuterGain')}
          >
            <CompoundNumericInput
              min={0}
              max={1}
              step={0.01}
              value={audioComponent.mediaConeOuterGain}
              onChange={updateProperty(PositionalAudioSettingsComponent, 'mediaConeOuterGain')}
            />
          </InputGroup>
        </>
      )}
      <InputGroup
        name="Use Simple Materials"
        label={t('editor:properties.scene.lbl-simpleMaterials')}
        info={t('editor:properties.scene.info-simpleMaterials')}
      >
        <BooleanInput
          value={hasComponent(props.node.entity, SimpleMaterialTagComponent)}
          onChange={onChangeUseSimpleMaterials}
        />
      </InputGroup>
      <InputGroup
        name="LODs"
        label={t('editor:properties.scene.lbl-lods')}
        info={t('editor:properties.scene.info-lods')}
      >
        <Vector3Input
          hideLabels
          value={renderSettingComponent.LODs}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={updateProperty(RenderSettingComponent, 'LODs')}
        />
      </InputGroup>
      <InputGroup name="Override Renderer Settings" label={t('editor:properties.scene.lbl-rendererSettings')}>
        <BooleanInput
          value={renderSettingComponent.overrideRendererSettings}
          onChange={updateProperty(RenderSettingComponent, 'overrideRendererSettings')}
        />
      </InputGroup>
      {renderSettingComponent.overrideRendererSettings && (
        <>
          <InputGroup
            name="Use Cascading Shadow Maps"
            label={t('editor:properties.scene.lbl-csm')}
            info={t('editor:properties.scene.info-csm')}
          >
            <BooleanInput value={renderSettingComponent.csm} onChange={updateProperty(RenderSettingComponent, 'csm')} />
          </InputGroup>
          <InputGroup
            name="Tone Mapping"
            label={t('editor:properties.scene.lbl-toneMapping')}
            info={t('editor:properties.scene.info-toneMapping')}
          >
            <SelectInput
              options={ToneMappingOptions}
              value={renderSettingComponent.toneMapping}
              onChange={updateProperty(RenderSettingComponent, 'toneMapping')}
            />
          </InputGroup>
          <InputGroup
            name="Tone Mapping Exposure"
            label={t('editor:properties.scene.lbl-toneMappingExposure')}
            info={t('editor:properties.scene.info-toneMappingExposure')}
          >
            <CompoundNumericInput
              min={0}
              max={10}
              step={0.1}
              value={renderSettingComponent.toneMappingExposure}
              onChange={updateProperty(RenderSettingComponent, 'toneMappingExposure')}
            />
          </InputGroup>
          <InputGroup
            name="Tone Mapping Exposure"
            label={t('editor:properties.scene.lbl-shadowMapType')}
            info={t('editor:properties.scene.info-shadowMapType')}
          >
            <SelectInput
              options={ShadowTypeOptions}
              value={renderSettingComponent.shadowMapType}
              onChange={updateProperty(RenderSettingComponent, 'shadowMapType')}
            />
          </InputGroup>
        </>
      )}
    </NodeEditor>
  )
}

// setting icon component with icon name
SceneNodeEditor.iconComponent = LanguageIcon

export default SceneNodeEditor
