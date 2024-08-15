import React, { FC, InputHTMLAttributes, ReactElement } from 'react'
import cx from 'classnames'
import { omit } from 'lodash'

import styles from './styles.module.scss'

export interface Props extends InputHTMLAttributes<HTMLInputElement> {
  inputRef?: React.Ref<HTMLInputElement>
  append?: ReactElement
  invalid?: boolean
  label?: {
    text?: string
    className?: string
  }
}

export const InputText: FC<Props> = (props) => {
  const { className, inputRef, type = 'text', label, name, id, append, invalid, value } = props
  const { text: labelText, className: labelClassName = '' } = label ?? {}
  const inputEl = (
    <input
      {...omit(props, 'inputRef', 'labelText', 'append', 'invalid')}
      type={type}
      ref={inputRef}
      value={value || ''}
      className={cx(
        styles.input,
        {
          [styles.withAppend]: append,
          [styles.invalid]: invalid,
        },
        className,
      )}
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
