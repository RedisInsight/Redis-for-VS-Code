import React from 'react'
import { FormikProps } from 'formik'
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
        <div>
          <InputText
            name="name"
            id="name"
            data-testid="name"
            placeholder="Enter Database Alias"
            label={{ text: 'Database Alias*' }}
            value={formik.values.name ?? ''}
            maxLength={500}
            onChange={formik.handleChange}
          />
        </div>
      </div>
      <div>
        <div>
          <InputText
            name="sentinelMasterName"
            id="sentinelMasterName"
            data-testid="primary-group"
            placeholder="Enter Primary Group Name"
            label={{ text: 'Primary Group Name*' }}
            value={formik.values.sentinelMasterName ?? ''}
            maxLength={500}
            onChange={formik.handleChange}
          />
        </div>
      </div>
    </>
  )
}

export { PrimaryGroupSentinel }
