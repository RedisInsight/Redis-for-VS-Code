import React, { ChangeEvent, useId } from 'react'
import cx from 'classnames'
import { FormikProps } from 'formik'

import { validateNumber } from 'uiSrc/utils'
import { DbConnectionInfo } from 'uiSrc/interfaces'
import { Checkbox, InputText } from 'uiSrc/ui'
import styles from './styles.module.scss'

export interface Props {

  formik: FormikProps<DbConnectionInfo>
}

const DbIndex = (props: Props) => {
  const { formik } = props

  const id = useId()

  const handleChangeDbIndexCheckbox = (e: ChangeEvent<HTMLInputElement>): void => {
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
        <div>
          <Checkbox
            id={`${id} over db`}
            name="showDb"
            labelText="Select Logical Database"
            checked={!!formik.values.showDb}
            onChange={handleChangeDbIndexCheckbox}
            data-testid="showDb"
          />
        </div>
      </div>

      {formik.values.showDb && (
        <div>
          <div className={cx('w-[200px]')}>
            <InputText
              name="db"
              id="db"
              label={{ text: 'Database Index', className: 'min-w-[100px]' }}
              data-testid="db"
              placeholder="Enter Database Index"
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
        </div>
      )}
    </>
  )
}

export { DbIndex }
