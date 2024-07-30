import React from 'react'
import cx from 'classnames'
import { isUndefined } from 'lodash'
import { VscKey } from 'react-icons/vsc'
import * as l10n from '@vscode/l10n'

import { formatLongName, replaceSpaces } from 'uiSrc/utils'
import { Tooltip } from 'uiSrc/ui'
import styles from './styles.module.scss'

export interface Props {
  nameString?: string
  shortString?: string
}

export const KeyRowName = (props: Props) => {
  const { shortString, nameString } = props

  if (isUndefined(shortString)) {
    return (
      <span>...</span>
    )
  }

  // Better to cut the long string, because it could affect virtual scroll performance
  const nameContent = replaceSpaces(shortString?.substring?.(0, 200))
  const nameTooltipTitle = l10n.t('Key Name')
  const nameTooltipContent = formatLongName(nameString)

  return (
    <Tooltip
      title={nameTooltipTitle}
      content={nameTooltipContent}
      mouseEnterDelay={300}
      className={cx(styles.keyNameContainer)}
    >
      <>
        <VscKey className={cx(styles.icon)} />
        <div className={cx(styles.keyName)} data-testid={`key-${shortString}`}>
          {nameContent}
        </div>
      </>
    </Tooltip>
  )
}
