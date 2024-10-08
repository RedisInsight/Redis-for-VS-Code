import React, { FC } from 'react'
import cx from 'classnames'
import { VscCheck } from 'react-icons/vsc'
import CheckboxRC, { CheckboxChangeEvent, CheckboxProps } from 'rc-checkbox'

import styles from './styles.module.scss'

export interface Props extends CheckboxProps {
  containerClassName?: string
  inputRef?: React.Ref<HTMLInputElement>
  labelText?: string | JSX.Element | JSX.Element[]
}

export interface CheckboxEvent extends CheckboxChangeEvent {}

export const Checkbox: FC<Props> = (props) => {
  const { className, labelText, disabled, containerClassName = '', ...restProps } = props

  return (
    <label className={cx(styles.container, containerClassName, { [styles.disabled]: disabled })}>
      <CheckboxRC
        {...restProps}
        disabled={disabled}
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
