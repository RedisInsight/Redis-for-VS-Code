import React from 'react'
import { FormikProps } from 'formik'

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
          Database Index:
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
            label={{ text: 'Username' }}
            maxLength={200}
            placeholder="Enter Username"
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
            label={{ text: 'Password' }}
            className="passwordField"
            maxLength={200}
            placeholder="Enter Password"
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
