import React from 'react'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscNewFile } from 'react-icons/vsc'

import styles from './styles.module.scss'

export interface Props {
  onFileChange: (string: string) => void
  onClick?: () => void
  accept?: string
  id?: string
}

export const UploadFile = (props: Props) => {
  const { onFileChange, onClick, accept, id = 'upload-input-file' } = props

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        onFileChange(e?.target?.result as string)
      }
      reader.readAsText(e.target.files[0])
      // reset input value after reading file
      e.target.value = ''
    }
  }

  return (
    <VSCodeButton className={styles.emptyBtn}>
      <label htmlFor={id} className={styles.uploadBtn} data-testid="upload-file-btn">
        <VscNewFile className={styles.icon} />
        <span className={styles.label}>{l10n.t('Upload')}</span>
        <input
          type="file"
          id={id}
          onClick={(event) => {
            event.stopPropagation()
            onClick?.()
          }}
          data-testid={id}
          accept={accept || '*'}
          onChange={handleFileChange}
          className={styles.fileDrop}
          aria-label="Select file"
        />
      </label>
    </VSCodeButton>
  )
}
