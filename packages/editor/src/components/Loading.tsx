import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

/**
 * StyledLoading provides the styles for loading component.
 *
 * @type {styled component}
 */
const StyledLoading = (styled as any).div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: ${(props) => (props.isFullscreen ? '100vh' : '100%')};
  width: ${(props) => (props.isFullScreen ? '100vw' : '100%')};
  min-height: 300px;

  svg {
    margin-bottom: 20px;
  }
`

/**
 * loading class used to render loading message.
 *
 * @type {component class}
 */
export const Loading = (props: any) => {
  const { t } = useTranslation()

  //creating and rendering loading view
  return (
    <StyledLoading fullScreen={props.fullScreen}>
      {t('editor:lbl-return')}
      {props.message}
    </StyledLoading>
  )
}

export default Loading
