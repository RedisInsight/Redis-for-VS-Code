import React, { FC } from 'react'
import cx from 'classnames'
import { VscCheck } from 'react-icons/vsc'
import CheckboxRC, { CheckboxProps } from 'rc-checkbox'

import styles from './styles.module.scss'

export interface Props extends CheckboxProps {
  inputRef?: React.Ref<HTMLInputElement>
  labelText?: string | JSX.Element | JSX.Element[]
}

export const Checkbox: FC<Props> = (props) => {
  const { className, labelText, ...restProps } = props

  return (
    <label className={styles.container}>
      <CheckboxRC
        {...restProps}
        prefixCls="ri-checkbox"
        className={cx(styles.checkbox, className)}
      />
      <div className={styles.checkmarkContainer}>
        <VscCheck className={styles.checkmark} />
      </div>
      {labelText}
    </label>
  )
}
