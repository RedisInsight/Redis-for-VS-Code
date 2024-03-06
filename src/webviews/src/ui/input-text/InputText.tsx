import React, { FC, InputHTMLAttributes, ReactElement } from 'react'
import cx from 'classnames'
import { omit } from 'lodash'

import styles from './styles.module.scss'

export interface Props extends InputHTMLAttributes<HTMLInputElement> {
  inputRef?: React.Ref<HTMLInputElement>
  append?: ReactElement
  label?: {
    text?: string
    className?: string
  }
}

export const InputText: FC<Props> = (props) => {
  const { className, inputRef, type = 'text', label, name, id, append } = props
  const { text: labelText, className: labelClassName = '' } = label ?? {}
  const inputEl = (
    <input
      {...omit(props, 'inputRef', 'labelText', 'append')}
      type={type}
      ref={inputRef}
      className={cx(styles.input, { [styles.withAppend]: !!append }, className)}
    />
  )
  return (label && name && id) ? (
    <label
      className={cx('flex items-center')}
    >
      <div className={cx('pr-1', { [labelClassName]: labelClassName })}>{labelText}</div>
      {append}
      {inputEl}
    </label>
  ) : <>{append && <div className={styles.append}>{append}</div>}{inputEl}</>
}
