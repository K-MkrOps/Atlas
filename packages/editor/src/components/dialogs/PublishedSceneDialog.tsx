import React from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '../inputs/Button'
import PreviewDialog from './PreviewDialog'

/**
 * PublishedSceneDialog used to show dialog when scene get published.
 *
 * @param       {function} onCancel
 * @param       {string} sceneName
 * @param       {string} sceneUrl
 * @param       {string} screenshotUrl
 * @param       {any} props
 * @constructor
 */
export function PublishedSceneDialog({ onCancel, sceneName, sceneUrl, screenshotUrl, ...props }) {
  const { t } = useTranslation()
  return (
    <PreviewDialog imageSrc={screenshotUrl} title={t('editor:dialog.published.title')} {...props}>
      <h1>{sceneName}</h1>
      <p>{t('editor:dialog.published.header')}</p>
      <Button as="a" href={sceneUrl} target="_blank">
        {t('editor:dialog.published.lbl-view')}
      </Button>
    </PreviewDialog>
  )
}

export default PublishedSceneDialog
