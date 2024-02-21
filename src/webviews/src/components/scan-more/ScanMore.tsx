import React, { FC } from 'react'
import { isNull } from 'lodash'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'

import { Nullable } from 'uiSrc/interfaces'

export interface Props {
  loading: boolean
  scanned?: number
  totalItemsCount?: Nullable<number>
  nextCursor?: string
  loadMoreItems?: (config: any) => void
}

// const WARNING_MESSAGE = 'Scanning additional keys may decrease performance and memory available.'

export const ScanMore: FC<Props> = ({
  scanned = 0,
  totalItemsCount = 0,
  loading,
  loadMoreItems,
  nextCursor,
}) => (
  <>
    {((scanned || isNull(totalItemsCount)))
      && nextCursor !== '0'
      && (
        <VSCodeButton
          appearance="secondary"
          disabled={loading}
          data-testid="scan-more"
          className="absolute right-0 z-10 mt-6"
          onClick={loadMoreItems}
        >
          {l10n.t('Scan more')}
        </VSCodeButton>
      )}
  </>
)
