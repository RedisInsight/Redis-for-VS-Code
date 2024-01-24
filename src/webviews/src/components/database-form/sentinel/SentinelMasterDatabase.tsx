import React from 'react'
import { FormikProps } from 'formik'
import * as l10n from '@vscode/l10n'
import { DbConnectionInfo, Nullable } from 'uiSrc/interfaces'
import { SECURITY_FIELD } from 'uiSrc/constants'
import { InputText } from 'uiSrc/ui'

import styles from '../styles.module.scss'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
  isCloneMode: boolean
  db: Nullable<number>
}

const SentinelMasterDatabase = (props: Props) => {
  const { db, isCloneMode, formik } = props
  return (
    <>
      {(!!db && !isCloneMode) && (
        <div className={styles.sentinelCollapsedField}>
          {l10n.t('Database Index:')}
          <span className="pl-1">
            <div>{db}</div>
          </span>
        </div>
      )}
      <div>
        <div>
          <InputText
            name="sentinelMasterUsername"
            id="sentinelMasterUsername"
            label={{ text: l10n.t('Username') }}
            maxLength={200}
            placeholder={l10n.t('Enter Username')}
            value={formik.values.sentinelMasterUsername ?? ''}
            onChange={formik.handleChange}
            data-testid="sentinel-mater-username"
          />
        </div>

        <div>
          <InputText
            type="password"
            name="sentinelMasterPassword"
            id="sentinelMasterPassword"
            data-testid="sentinel-master-password"
            label={{ text: l10n.t('Password') }}
            className="passwordField"
            maxLength={200}
            placeholder={l10n.t('Enter Password')}
            value={formik.values.sentinelMasterPassword === true ? SECURITY_FIELD : formik.values.sentinelMasterPassword ?? ''}
            onChange={formik.handleChange}
            onFocus={() => {
              if (formik.values.sentinelMasterPassword === true) {
                formik.setFieldValue(
                  'sentinelMasterPassword',
                  '',
                )
              }
            }}
          />
        </div>
      </div>
    </>
  )
}

export { SentinelMasterDatabase }
