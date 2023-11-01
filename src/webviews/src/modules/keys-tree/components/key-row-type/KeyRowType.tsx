import React, { FC } from 'react'
import cx from 'classnames'

import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { getGroupTypeDisplay } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  type: KeyTypes | ModulesKeyTypes
  nameString: string
}

export const KeyRowType: FC<Props> = ({ type, nameString }) => {
  if (!type) {
    return null
  }

  return (
    <span
      className={cx(styles.keyType)}
      data-testid={`key-type-${type}_${nameString}`}
    >
      {getGroupTypeDisplay(type)}
    </span>
  )
}
