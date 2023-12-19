import React, { FC, InputHTMLAttributes } from 'react'
import cx from 'classnames'
import { omit } from 'lodash'

import styles from './styles.module.scss'

export interface Props extends InputHTMLAttributes<HTMLTextAreaElement> {
  inputRef?: React.Ref<HTMLTextAreaElement>;
}

export const TextArea: FC<Props> = (props) => {
  const { className, inputRef } = props

  return (
    <textarea
      {...omit(props, 'inputRef')}
      ref={inputRef}
      className={cx(styles.input, className)}
    />
  )
}
