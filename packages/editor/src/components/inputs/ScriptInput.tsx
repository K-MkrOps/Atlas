import React from 'react'

import { CustomScriptFileTypes } from '@atlas/engine/src/assets/constants/fileTypes'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'

/**
 * ScriptInput used to render component view for script inputs.
 *
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export function ScriptInput({ onChange, ...rest }) {
  return (
    <FileBrowserInput
      acceptFileTypes={CustomScriptFileTypes}
      acceptDropItems={ItemTypes.Scripts}
      onChange={onChange}
      {...rest}
    />
  )
}

export default ScriptInput
