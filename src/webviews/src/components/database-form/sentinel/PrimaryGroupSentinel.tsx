import React from 'react'
import { FormikProps } from 'formik'
import * as l10n from '@vscode/l10n'
import { DbConnectionInfo } from 'uiSrc/interfaces'
import { InputText } from 'uiSrc/ui'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const PrimaryGroupSentinel = (props: Props) => {
  const { formik } = props
  return (
    <>
      <div>
        <InputText
          name="name"
          id="name"
          data-testid="name"
          placeholder={l10n.t('Enter Database Alias')}
          label={{ text: l10n.t('Database Alias*') }}
          value={formik.values.name ?? ''}
          maxLength={500}
          onChange={formik.handleChange}
        />
      </div>
      <div>
        <InputText
          name="sentinelMasterName"
          id="sentinelMasterName"
          data-testid="primary-group"
          placeholder={l10n.t('Enter Primary Group Name')}
          label={{ text: l10n.t('Primary Group Name*') }}
          value={formik.values.sentinelMasterName ?? ''}
          maxLength={500}
          onChange={formik.handleChange}
        />
      </div>
    </>
  )
}

export { PrimaryGroupSentinel }
