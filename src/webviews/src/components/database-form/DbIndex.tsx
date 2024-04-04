import React, { ChangeEvent, useId } from 'react'
import cx from 'classnames'
import { FormikProps } from 'formik'
import * as l10n from '@vscode/l10n'
import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react'
import { CheckboxChangeEvent } from 'rc-checkbox'

import { validateNumber } from 'uiSrc/utils'
import { DbConnectionInfo } from 'uiSrc/interfaces'
import { Checkbox, InputText } from 'uiSrc/ui'

export interface Props {

  formik: FormikProps<DbConnectionInfo>
}

const DbIndex = (props: Props) => {
  const { formik } = props

  const id = useId()

  const handleChangeDbIndexCheckbox = (e: CheckboxChangeEvent): void => {
    const isChecked = e.target.checked
    if (!isChecked) {
      // Reset db field to initial value
      formik.setFieldValue('db', null)
    }
    formik.setFieldValue('showDb', isChecked)
  }

  return (
    <>
      <div>
        <Checkbox
          id={`${id} over db`}
          name="showDb"
          labelText={l10n.t('Select Logical Database')}
          checked={!!formik.values.showDb}
          onChange={handleChangeDbIndexCheckbox}
          data-testid="showDb"
        />
      </div>

      {formik.values.showDb && (
        <div className={cx('w-[200px]')}>
          <InputText
            name="db"
            id="db"
            label={{ text: l10n.t('Database Index'), className: 'min-w-[100px]' }}
            data-testid="db"
            placeholder={l10n.t('Enter Database Index')}
            className="min-w-[256px]"
            value={formik.values.db ?? '0'}
            maxLength={6}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              formik.setFieldValue(
                e.target.name,
                validateNumber(e.target.value.trim()),
              )
            }}
            type="text"
            min={0}
          />
        </div>
      )}
      {formik.values.showDb && (<VSCodeDivider className="divider mt-6 mb-3" />)}
    </>
  )
}

export { DbIndex }
