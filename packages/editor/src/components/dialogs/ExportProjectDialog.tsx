import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import BooleanInput from '../inputs/BooleanInput'
import FormField from '../inputs/FormField'
import Dialog from './Dialog'

/**
 * FormContainer used as a wrapper element for FormFields.
 *
 * @type {Styled Component}
 */
const FormContainer = (styled as any).div`
  display: flex;
  flex-direction: column;
  flex: 1;
`

/**
 * ExportProjectDialog used to provide view containing FormFields.
 *
 * @param       {Object} defaultOptions
 * @param       {function} onConfirm
 * @param       {function} onCancel
 * @constructor
 */
export function ExportProjectDialog({ defaultOptions, onConfirm, onCancel }) {
  const { t } = useTranslation()

  // initializing options using defaultOptions
  const [options, setOptions] = useState(defaultOptions)

  //callback function used to handle changes in options.shouldCombineMeshes property
  const onChangeCombineMeshes = useCallback(
    (shouldCombineMeshes) => {
      setOptions({ ...options, shouldCombineMeshes })
    },
    [options, setOptions]
  )

  // callback function used to handle change in options.shouldRemoveUnusedObjects property
  const onChangeRemoveUnusedObjects = useCallback(
    (shouldRemoveUnusedObjects) => {
      setOptions({ ...options, shouldRemoveUnusedObjects })
    },
    [options, setOptions]
  )

  // callback function used to handle confirmation on dialog.
  const onConfirmCallback = useCallback(
    (e) => {
      e.preventDefault()
      onConfirm(options)
    },
    [options, onConfirm]
  )

  // callback functionto handle cancel of confirmation dialog.
  const onCancelCallback = useCallback(
    (e) => {
      e.preventDefault()
      onCancel()
    },
    [onCancel]
  )

  // returning view containing FormFields
  return (
    <Dialog
      title={t('editor:dialog.exportProject.title')}
      onConfirm={onConfirmCallback}
      onCancel={onCancelCallback}
      confirmLabel={t('editor:dialog.exportProject.lbl-confirm')}
    >
      <FormContainer>
        <FormField>
          <label htmlFor="combineMeshes">{t('editor:dialog.exportProject.lbl-combineMesh')}</label>
          <BooleanInput id="combineMeshes" value={options.shouldCombineMeshes} onChange={onChangeCombineMeshes} />
        </FormField>
        <FormField>
          <label htmlFor="removeUnusedObjects">{t('editor:dialog.exportProject.lbl-removeUnused')}</label>
          <BooleanInput
            id="removeUnusedObjects"
            value={options.shouldRemoveUnusedObjects}
            onChange={onChangeRemoveUnusedObjects}
          />
        </FormField>
      </FormContainer>
    </Dialog>
  )
}

export default ExportProjectDialog
