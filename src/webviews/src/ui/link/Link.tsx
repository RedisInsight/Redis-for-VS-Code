import React, { FC, AnchorHTMLAttributes, PropsWithChildren } from 'react'
import cx from 'classnames'
import { omit } from 'lodash'

import styles from './styles.module.scss'

export interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
}

export const Link: FC<PropsWithChildren<Props>> = (props) => {
  const { className, children } = props

  return (
    <a
      {...omit(props, 'text')}
      className={cx(styles.link, className)}
    >
      {children}
    </a>
  )
}
