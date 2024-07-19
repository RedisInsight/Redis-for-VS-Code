import React, { ChangeEvent, useId } from 'react'
import { FormikProps } from 'formik'
import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react'
import * as l10n from '@vscode/l10n'
import { CheckboxChangeEvent } from 'rc-checkbox'

import { KeyValueCompressor, NONE } from 'uiSrc/constants'
import { DbConnectionInfo } from 'uiSrc/interfaces'
import { Checkbox, Select } from 'uiSrc/ui'
import styles from './styles.module.scss'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const DbCompressor = (props: Props) => {
  const { formik } = props

  const id = useId()

  const optionsCompressor = [
    {
      value: NONE,
      label: l10n.t('No decompression'),
    },
    {
      value: KeyValueCompressor.GZIP,
      label: 'GZIP',
    },
    {
      value: KeyValueCompressor.LZ4,
      label: 'LZ4',
    },
    {
      value: KeyValueCompressor.SNAPPY,
      label: 'SNAPPY',
    },
    {
      value: KeyValueCompressor.ZSTD,
      label: 'ZSTD',
    },
    {
      value: KeyValueCompressor.Brotli,
      label: 'Brotli',
    },
    {
      value: KeyValueCompressor.PHPGZCompress,
      label: 'PHP GZCompress',
    },
  ]

  const handleChangeDbCompressorCheckbox = (e: CheckboxChangeEvent): void => {
    const isChecked = e.target.checked
    if (!isChecked) {
      // Reset db field to initial value
      formik.setFieldValue('compressor', NONE)
    }

    formik.setFieldValue('showCompressor', isChecked)
  }

  return (
    <>
      <div>
        <Checkbox
          id={`${id} over db compressor`}
          name="showCompressor"
          labelText={l10n.t('Enable automatic data decompression')}
          checked={!!formik.values.showCompressor}
          onChange={handleChangeDbCompressorCheckbox}
          data-testid="showCompressor"
        />
      </div>

      {formik.values.showCompressor && (
        <div className="flex items-center mb-4">
          <div className="pr-1">{l10n.t('Decompression format')}</div>
          <div>
            <Select
              options={optionsCompressor}
              containerClassName="database-form-select"
              itemClassName="database-form-select__option"
              idSelected={formik.values.compressor ?? NONE}
              onChange={(value) => {
                formik.setFieldValue(
                  'compressor',
                  value || NONE,
                )
              }}
              testid="select-compressor"
            />
          </div>
        </div>
      )}
    </>
  )
}

export { DbCompressor }
