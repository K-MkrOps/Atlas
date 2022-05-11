import React from 'react'
import { useTranslation } from 'react-i18next'

import { isTouchAvailable } from '@atlas/engine/src/common/functions/DetectFeatures'

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import TouchApp from '@mui/icons-material/TouchApp'
import Snackbar from '@mui/material/Snackbar'

import styles from './index.module.scss'

interface Props {
  message?: string
  className?: string | ''
}

const TooltipContainer = (props: Props) => {
  const interactTip = isTouchAvailable ? <TouchApp /> : 'E'
  const { t } = useTranslation()
  return props.message ? (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      className={styles.TooltipSnackBar}
      open={true}
      autoHideDuration={1000}
    >
      <section className={styles.innerHtml + ' MuiSnackbarContent-root'}>
        <ErrorOutlineIcon color="secondary" />
        {t('common:tooltip.pressKey', { tip: interactTip, message: props.message })}
      </section>
    </Snackbar>
  ) : null
}

export default TooltipContainer
