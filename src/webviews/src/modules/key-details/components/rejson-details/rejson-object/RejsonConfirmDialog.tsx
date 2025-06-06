import React from 'react'
import Popup from 'reactjs-popup'
import { VscClose } from 'react-icons/vsc'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import * as l10n from '@vscode/l10n'

import { RiButton } from 'uiSrc/ui'

export interface ReJSONConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

const ReJSONConfirmDialog = ({
  open,
  onClose,
  onConfirm,
}: ReJSONConfirmDialogProps) => (
  <Popup modal open={open} closeOnDocumentClick={false} className="">
    <h1>{l10n.t('Duplicate JSON key detected')}</h1>

    <h2>{l10n.t('You already have the same JSON key.')}</h2>

    <p>
      {l10n.t(
        'If you proceed, a value of the existing JSON key will be overwritten.',
      )}
    </p>

    <RiButton className="absolute top-4 right-4" onClick={onClose}>
      <VscClose />
    </RiButton>

    <VSCodeButton
      appearance="primary"
      data-testid="confirm-btn"
      onClick={onConfirm}
    >
      {l10n.t('Overwrite')}
    </VSCodeButton>
  </Popup>
)

export default ReJSONConfirmDialog
