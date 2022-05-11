import React from 'react'

/**
 * Icon used to render view for icon component.
 *
 * @param {object} props
 * @constructor
 */
export function Icon(props) {
  return <img src={props.src} style={{ color: props.color, width: props.size, height: props.size }} />
}

Icon.defaultProps = {
  color: 'white',
  size: 32
}
export default Icon
