import React, { FC, InputHTMLAttributes } from 'react'
import cx from 'classnames'
import { omit } from 'lodash'

import styles from './styles.module.scss'

export interface Props extends InputHTMLAttributes<HTMLInputElement> {
  inputRef?: React.Ref<HTMLInputElement>
  label?: {
    text?: string
    className?: string
  }
}

export const InputText: FC<Props> = (props) => {
  const { className, inputRef, type = 'text', label, name, id } = props
  const { text: labelText, className: labelClassName = '' } = label ?? {}
  const inputEl = (
    <input
      {...omit(props, 'inputRef', 'labelText')}
      type={type}
      ref={inputRef}
      className={cx(styles.input, className)}
    />
  )
  return (label && name && id) ? (
    <label
      className={cx('flex items-center')}
    >
      <div className={cx('pr-1', { [labelClassName]: labelClassName })}>{labelText}</div>
      {inputEl}
    </label>
  ) : inputEl
}
