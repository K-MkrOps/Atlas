import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'

/**
 * CollapsibleContainer used to provide styles for Collapsible div.
 *
 * @type {styled component}
 */
const CollapsibleContainer = (styled as any).div`
  display: flex;
  flex-direction: column;
  padding: 4px 8px;
`

/**
 * CollapsibleLabel used to provide styles for Collapsible label.
 *
 * @type {styled container}
 */
const CollapsibleLabel = (styled as any).div`
  color: var(--textColor);
  cursor: pointer;
  display: inline-block;

  :hover {
    color: var(--textColor);
  }
`

/**
 * CollapsibleContent used to provides styles to Collapsible content.
 *
 * @type {styled component}
 */
const CollapsibleContent = (styled as any).div`
  display: flex;
  flex-direction: column;
  padding: 4px 8px;
`

/**
 * CollapseIcon used to provide styles to icon.
 *
 * @type  {styled component}
 */
const CollapseIcon = (styled as any).div``

/**
 * Collapsible used to render the view of component.
 *
 * @param       {string} label
 * @param       {boolean} open
 * @param       {node} children
 * @constructor
 */
export function Collapsible({ label, open, children }) {
  const [collapsed, setCollapsed] = useState(!open)

  /**
   * toggleCollapsed callback function used to handle toggle on collapse.
   *
     * @type {styled component}
   */
  const toggleCollapsed = useCallback(() => {
    setCollapsed((collapsed) => !collapsed)
  }, [setCollapsed])

  return (
    <CollapsibleContainer>
      <CollapsibleLabel onClick={toggleCollapsed}>
        <CollapseIcon as={collapsed ? ArrowRightIcon : ArrowDropDownIcon} size={14} collapsed={collapsed} />
        {label}
      </CollapsibleLabel>
      {!collapsed && <CollapsibleContent>{children}</CollapsibleContent>}
    </CollapsibleContainer>
  )
}

Collapsible.defaultProps = {
  open: false
}

export default Collapsible
