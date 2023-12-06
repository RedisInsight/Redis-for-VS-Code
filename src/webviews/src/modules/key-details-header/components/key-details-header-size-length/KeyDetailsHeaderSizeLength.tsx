import React from 'react'
import { useShallow } from 'zustand/react/shallow'
import * as l10n from '@vscode/l10n'

import { LENGTH_NAMING_BY_TYPE, MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'
import { formatBytes } from 'uiSrc/utils'

import { useSelectedKeyStore } from 'uiSrc/store'
import styles from './styles.module.scss'

export interface Props {
  width: number
}

const KeyDetailsHeaderSizeLength = ({
  width,
}: Props) => {
  const { type, size, length } = useSelectedKeyStore(useShallow((state) => ({
    type: state.data?.type,
    size: state.data?.size,
    length: state.data?.length,
  })))

  return (
    <>
      {size && (
        <div>
          <div
            className={styles.subtitleText}
            data-testid="key-size-text"
          >
            <div title={`${l10n.t('Key Size')}\n${formatBytes(size, 3)}`}>
              {width > MIDDLE_SCREEN_RESOLUTION && l10n.t('Key Size: ')}
              {formatBytes(size, 0)}
            </div>
          </div>
        </div>
      )}
      {type && (
        <div
          className={styles.subtitleText}
          data-testid="key-length-text"
        >
          {LENGTH_NAMING_BY_TYPE[type] ?? l10n.t('Length')}
          {': '}
          {length ?? '-'}
        </div>
      )}
    </>
  )
}

export { KeyDetailsHeaderSizeLength }
