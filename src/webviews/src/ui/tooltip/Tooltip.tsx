import React from 'react'
import Popup from 'reactjs-popup'
import { PopupProps } from 'reactjs-popup/dist/types'
import cx from 'classnames'
import { isString } from 'lodash'

export interface Props extends PopupProps {
  title?: JSX.Element | React.ReactNode | string
  content?: JSX.Element | React.ReactNode | string
  children: JSX.Element | React.ReactNode | string
  className?: string
}

export const Tooltip = (props: Props) => {
  const {
    keepTooltipInside = true,
    position = 'top center',
    title,
    children: childrenInit,
    content,
    trigger,
    className = '',
    ...restProps
  } = props

  if (!content) {
    return childrenInit
  }

  const children = isString(childrenInit) ? <div>{childrenInit}</div> : childrenInit

  return (
    <Popup
      keepTooltipInside={keepTooltipInside}
      position={position}
      on="hover"
      trigger={children as JSX.Element}
      {...restProps}
    >
      <div className={cx(className, 'max-w-[350px]')}>
        {!!title && <div className="font-bold">{title}</div>}
        {content}
      </div>
    </Popup>
  )
}
