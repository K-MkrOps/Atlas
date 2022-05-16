import React from 'react'
import styled from 'styled-components'

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'

import { InfoTooltip } from '../layout/Tooltip'
import NumericInput from './NumericInput'

/**
 *
 */
const StepperInputContainer = (styled as any).div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 24px;

  input {
    border-left-width: 0;
    border-right-width: 0;
    border-radius: 0;
  }
`

/**
 *
 */
const StepperButton = (styled as any).button`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => (props.value ? 'var(--blue)' : 'var(--toolbar)')};

  border: 1px solid var(--inputOutline);
  color: var(--textColor);

  width: 20px;
  padding: 0;

  ${(props) =>
    props.left
      ? `border-top-left-radius: 4px; border-bottom-left-radius: 4px;`
      : `border-top-right-radius: 4px; border-bottom-right-radius: 4px;`}

  :hover {
    background-color: var(--blueHover);
  }

  :active {
    background-color: var(--blue);
  }
`

/**
 *
 *
 * @param {any} style
 * @param {any} className
 * @param {any} decrementTooltip
 * @param {any} incrementTooltip
 * @param {any} rest
 * @returns
 */
export function NumericStepperInput({
  style,
  className,
  decrementTooltip,
  incrementTooltip,
  onChange,
  value,
  mediumStep,
  ...rest
}: any) {
  const onIncrement = () => onChange(value + mediumStep)
  const onDecrement = () => onChange(value - mediumStep)

  return (
    <StepperInputContainer style={style} className={className}>
      <InfoTooltip title={decrementTooltip} placement="bottom">
        <StepperButton left onClick={onDecrement}>
          <ArrowLeftIcon fontSize="small" />
        </StepperButton>
      </InfoTooltip>
      <NumericInput {...rest} onChange={onChange} value={value} mediumStep={mediumStep} />
      <InfoTooltip title={incrementTooltip} placement="bottom">
        <StepperButton right onClick={onIncrement}>
          <ArrowRightIcon fontSize="small" />
        </StepperButton>
      </InfoTooltip>
    </StepperInputContainer>
  )
}

export default NumericStepperInput
