import React from 'react'

import Grid from '@mui/material/Grid'

import { InfoTooltip } from '../layout/Tooltip'
import { InputGroupContainer, InputGroupContent, InputGroupInfo } from './InputGroup'
import NumericInput from './NumericInput'
import Scrubber from './Scrubber'

export interface NumericInputGroupProp {
  name?: string
  className?: any
  info?: any
  label?: any
  displayPrecision?: number
  smallStep?: number
  mediumStep?: number
  largeStep?: number
  min?: number
  max?: number
  value?: any
  onChange: Function
  unit?: string
  convertFrom?: any
  convertTo?: any
  disabled?: boolean
  default?: any
}

/**
 *
 * @param {any} name
 * @param {any} className
 * @param {any} rest
 * @returns
 */
export function NumericInputGroup({ name, className, info, label, ...rest }: NumericInputGroupProp) {
  const { displayPrecision, ...scrubberProps } = rest
  return (
    <InputGroupContainer>
      <Grid container spacing="10px">
        <Grid item xs={3} display="flex" alignItems="center" justifyContent="end">
          <InfoTooltip
            className="tooltip"
            title={label ?? name}
            disableInteractive
            placement="right-start"
            followCursor
          >
            <Scrubber {...scrubberProps}>{label}</Scrubber>
          </InfoTooltip>
        </Grid>
        <Grid item xs={9}>
          <InputGroupContent>
            <NumericInput {...rest} />
            {info && <InputGroupInfo info={info} />}
          </InputGroupContent>
        </Grid>
      </Grid>
    </InputGroupContainer>
  )
}

export default NumericInputGroup
