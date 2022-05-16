import React from 'react'
import styled from 'styled-components'

import Dialog from './Dialog'

// export function ConfirmDialog(props: Props) {
//   return <Dialog {...props}>{props?.message}</Dialog>
// }
// ConfirmDialog.defaultProps = {
//   title: 'Confirm',
//   message: 'Confirm action?'
// }
// export default ConfirmDialog

/**
 * ProgressContainer used as a wrapper element for the ProgressMessage and ProgressBar components.
 *
 * @type {Styled component}
 */
const ConfirmContainer = (styled as any).div`
  color: var(--textColor);
  display: flex;
  flex: 1;
  flex-direction: column;
  /* This forces firefox to give the contents a proper height. */
  overflow: hidden;
  padding: 8px;
`

/**
 * ProgressMessage used to provide styles to the message content on ProgressDialog.
 *
 * @type {styled component}
 */
const ConfirmMessage = (styled as any).div`
  padding-bottom: 24px;
  white-space: pre;
`

/**
 * ProgressDialog component used to render view.
 *
 * @param       {string} message    [content to be shown on the ProgressDialog]
 * @param       {function} onConfirm
 * @param       {boolean} cancelable
 * @param       {function} onCancel
 * @param       {any} props
 * @constructor
 */
export function ConfirmDialog(props) {
  console.log(props)
  // if (!props) return console.warn('hmm no props here buddy', props)
  return (
    <Dialog onCancel={props.cancelable ? props.onCancel : null} {...props}>
      <ConfirmContainer>
        <ConfirmMessage>{props.message}</ConfirmMessage>
      </ConfirmContainer>
    </Dialog>
  )
}

ConfirmDialog.defaultProps = {
  title: 'Confirm',
  message: 'Confirm action?'
}

export default ConfirmDialog
