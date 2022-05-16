import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

import Dialog from './Dialog'

/**
 * SupportDialog used to render content for support.
 *
 * @param       {function} onCancel
 * @param       {any} props
 * @constructor
 */
export function SupportDialog({ onCancel, ...props }) {
  const { t } = useTranslation()

  //returning view for SupportDialog
  return (
    <Dialog {...props} title={t('editor:dialog.support.title')}>
      <div>
        <p>{t('editor:dialog.support.header')}</p>
        <p>
          <Trans t={t} values={{ mail: 'support@atlasfoundation.dev' }} i18nKey="editor:dialog.support.msg">
            You can file a&nbsp;
            <a href="https://github.com/AtlasFoundation/Atlas/issues/new" target="_blank" rel="noopener noreferrer">
              GitHub Issue
            </a>
            &nbsp; or e-mail us for support at{' '}
            <a href="mailto:support@atlasfoundation.dev">support@atlasfoundation.dev</a>
          </Trans>
        </p>
        <p>
          <Trans t={t} i18nKey="editor:dialog.support.discord">
            You can also find us on&nbsp;
            <a href="https://discord.gg/atlasfoundation" target="_blank" rel="noopener noreferrer">
              Discord
            </a>
          </Trans>
        </p>
      </div>
    </Dialog>
  )
}

export default SupportDialog
