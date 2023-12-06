import React, { FC } from 'react'
import * as l10n from '@vscode/l10n'

export const NotFoundPage: FC = () => (
  <div className="flex h-full w-full px-5 py-1 overflow-x-auto" data-testid="key-details-page">
    {l10n.t('Page was not found')}
  </div>
)
