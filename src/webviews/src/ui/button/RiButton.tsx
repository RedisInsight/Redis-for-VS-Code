import React, { ButtonHTMLAttributes } from 'react'
import cx from 'classnames'

import styles from './styles.module.scss'

export interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {}

// https://react-popup.elazizi.com/component-api#trigger
export const RiButton = React.forwardRef<HTMLButtonElement, Props>(({ children, className, ...props }, ref) => (
  <button
    ref={ref}
    {...props}
    className={cx(styles.button, className)}
  >
    {children}
  </button>
))
