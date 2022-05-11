import React from 'react'
import styled from 'styled-components'

import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Grid from '@mui/material/Grid'

import { InfoTooltip } from '../layout/Tooltip'

/**
 * Used to provide styles for InputGroupContainer div.
 *
 * @type {Styled component}
 */
export const InputGroupContainer = (styled as any).div`
  display: flex;
  flex-direction: row;
  padding: 4px 8px;
  flex: 1 1 auto;
  flex-wrap: nowrap;
  min-height: 24px;

  ${(props) =>
    props.disabled &&
    `
    pointer-events: none;
    opacity: 0.3;
  `}

  .tooltip {
    color: var(--textColor);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

/**
 * Used to provide styles for InputGroupContent div.
 *
 * @type {Styled component}
 */
export const InputGroupContent = (styled as any).div`
  display: flex;
  justify-content: space-between; 

  &>*:first-child {
    max-width: calc(100% - 23px)
  }

  & > label {
    display: block;
    width: 25%;
    color: var(--textColor);
    padding-bottom: 2px;
    padding-top: 4px;
  }
`

export const InputGroupVerticalContainer = (styled as any).div`

  ${(props) =>
    props.disabled &&
    `
    pointer-events: none;
    opacity: 0.3;
  `}

  & > label {
    display: block;
    width: 25%;
    color: var(--textColor);
    padding-bottom: 2px;
    padding-top: 4px;
  }
`

export const InputGroupVerticalContent = (styled as any).div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-left: 8px;
`

/**
 * Used to provide styles for InputGroupInfoIcon div.
 *
 *  @type {styled component}
 */
export const InputGroupInfoIcon = (styled as any)(HelpOutlineIcon)`
  width: 18px;
  display: flex;
  margin-left: 5px;
  color: var(--iconButtonColor);
  cursor: pointer;
  align-self: center;
`

interface InputGroupInfoProp {
  info: string | JSX.Element
}

/**
 * Used to render InfoTooltip component.
 *
 * @param  {string} info
 * @constructor
 */
export function InputGroupInfo({ info }: InputGroupInfoProp) {
  return (
    <InfoTooltip title={info}>
      <InputGroupInfoIcon />
    </InfoTooltip>
  )
}

/**
 * Declaring proptypes for InputGroupInfo Component.
 *
 * @type {Object}
 */
type InputGroupPropType = React.PropsWithChildren<
  {
    name: string
    disabled?: boolean
    label?: string
    value?: any
  } & Partial<InputGroupInfoProp>
>

/**
 * InputGroup used to render the view of component.
 *
 * @param       {string} name
 * @param       {any} children
 * @param       {boolean} disabled
 * @param       {string} info
 * @param       {any} rest
 * @param       {string} label
 * @constructor
 */
export function InputGroup({ name, children, disabled, info, label, ...rest }: InputGroupPropType) {
  return (
    <InputGroupContainer disabled={disabled} {...rest}>
      <Grid container spacing="10px">
        <Grid item xs={3} display="flex" alignItems="center" justifyContent="end">
          <InfoTooltip
            className="tooltip"
            title={label ?? name}
            disableInteractive
            placement="right-start"
            followCursor
          >
            <label>{label}</label>
          </InfoTooltip>
        </Grid>
        <Grid item xs={9}>
          <InputGroupContent>
            {children}
            {info && <InputGroupInfo info={info} />}
          </InputGroupContent>
        </Grid>
      </Grid>
    </InputGroupContainer>
  )
}

export default InputGroup
