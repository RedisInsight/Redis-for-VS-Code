import React from 'react'
import * as l10n from '@vscode/l10n'
import cx from 'classnames'

import { RedisString } from 'uiSrc/interfaces'
import { PopoverDelete } from 'uiSrc/components'
import { formatLongName } from 'uiSrc/utils'
import { POPOVER_WINDOW_BORDER_WIDTH } from 'uiSrc/constants'
import styles from './styles.module.scss'

export interface Props {
  nameBuffer: RedisString
  nameString: string
  handleDelete?: (key: RedisString) => void
  handleDeletePopoverOpen?: () => void
}

export const KeyRowDelete = (props: Props) => {
  const { nameBuffer, nameString, handleDeletePopoverOpen, handleDelete } = props

  return (
    <div className={styles.container}>
      <PopoverDelete
        item={nameString}
        itemRaw={nameBuffer}
        testid={`remove-key-${nameString}`}
        header={`${formatLongName(nameString)}`}
        text={`${l10n.t(' will be deleted.')}`}
        approveTextBtn={l10n.t('Delete')}
        triggerClassName={cx(styles.trigger, 'group-hover:!flex')}
        maxWidth={window.innerWidth - POPOVER_WINDOW_BORDER_WIDTH}
        handleDeleteItem={handleDelete}
        handleButtonClick={handleDeletePopoverOpen}
      />
    </div>
  )
}
