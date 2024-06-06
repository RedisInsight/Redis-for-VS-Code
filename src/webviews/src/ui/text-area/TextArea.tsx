import React, { FC, TextareaHTMLAttributes } from 'react'
import cx from 'classnames'
import { omit } from 'lodash'

import styles from './styles.module.scss'

export interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  inputRef?: React.Ref<HTMLTextAreaElement>
  invalid?: boolean
  label?: {
    text?: string
    className?: string
  }
}

export const TextArea: FC<Props> = (props) => {
  const { className, inputRef, label, name, id, invalid } = props
  const { text: labelText, className: labelClassName = '' } = label ?? {}

  const textareaEl = (
    <textarea
      {...omit(props, 'inputRef', 'labelText', 'invalid')}
      ref={inputRef}
      className={cx(styles.input, className, { [styles.invalid]: invalid })}
    />
  )

  return (labelText && name && id) ? (
    <label
      className={cx('flex')}
    >
      <div className={cx('pr-1', { [labelClassName]: labelClassName })}>{labelText}</div>
      {textareaEl}
    </label>
  ) : textareaEl
}
