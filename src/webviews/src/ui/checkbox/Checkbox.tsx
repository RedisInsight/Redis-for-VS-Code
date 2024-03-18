import React, { FC, InputHTMLAttributes } from 'react'
import cx from 'classnames'
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react'
import { omit } from 'lodash'

import styles from './styles.module.scss'

export interface Props extends InputHTMLAttributes<HTMLInputElement> {
  inputRef?: React.Ref<HTMLInputElement>
  labelText?: string | JSX.Element | JSX.Element[]
}

export const Checkbox: FC<Props> = (props) => {
  const { className, labelText } = props

  return (
    <VSCodeCheckbox
      {...omit(props, 'inputRef', 'labelText')}
      className={cx(styles.checkbox, className)}
    >
      {labelText}
    </VSCodeCheckbox>
  )
}
