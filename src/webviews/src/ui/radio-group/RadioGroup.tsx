import React, { FC } from 'react'
import { VSCodeRadioGroup, VSCodeRadio } from '@vscode/webview-ui-toolkit/react'

import cx from 'classnames'

import { Nullable } from 'uiSrc/interfaces'
import styles from './styles.module.scss'

export interface RadioGroupOption {
  id: string
  labelText: string
  testid?: string
}

export interface Props {
  options: RadioGroupOption[]
  onChange: (event: string) => void
  idSelected?: Nullable<string>
  containerClassName?: string
  itemClassName?: string
  testid?: string
  orientation?: 'horizontal' | 'vertical'
}

export const RadioGroup: FC<Props> = (props) => {
  const { options, onChange, idSelected, containerClassName, itemClassName, testid, orientation = 'vertical' } = props

  return (
    <VSCodeRadioGroup
      data-testid={testid}
      className={cx(styles.container, containerClassName)}
      orientation={orientation}
    >
      {options.map(({ id, labelText, testid }) => (
        <div key={id}>
          <VSCodeRadio
            name="radioGroup"
            value={id}
            onClick={() => onChange(id)}
            data-testid={testid}
            className={cx(styles.input, itemClassName)}
            checked={idSelected === id}
          >
            {labelText}
          </VSCodeRadio>
        </div>
      ))}
    </VSCodeRadioGroup>
  )
}
