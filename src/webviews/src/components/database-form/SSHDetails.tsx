import React, { ChangeEvent, useId } from 'react'
import cx from 'classnames'
import { FormikProps } from 'formik'
import {
  selectOnFocus,
  validateField,
  validatePortNumber,
} from 'uiSrc/utils'
import { SECURITY_FIELD, MAX_PORT_NUMBER, SshPassType } from 'uiSrc/constants'
import { DbConnectionInfo } from 'uiSrc/interfaces'
import { Checkbox, InputText, RadioGroup, RadioGroupOption, TextArea } from 'uiSrc/ui'

import styles from './styles.module.scss'

export interface Props {

  formik: FormikProps<DbConnectionInfo>
}

const SSHDetails = (props: Props) => {
  const { formik } = props

  const id = useId()

  const sshPassTypeOptions: RadioGroupOption[] = [
    { id: SshPassType.Password, labelText: 'Password', testid: 'radio-btn-password' },
    { id: SshPassType.PrivateKey, labelText: 'Private Key', testid: 'radio-btn-privateKey' },
  ]

  return (
    <div className={styles.sshContainer}>
      <div>
        <div>
          <Checkbox
            id={`${id} ssh`}
            name="ssh"
            labelText="Use SSH Tunnel"
            checked={!!formik.values.ssh}
            onChange={(e) => formik.setFieldValue('ssh', e.target.checked)}
            data-testid="use-ssh"
          />
        </div>
      </div>

      {formik.values.ssh && (
      <>
        <div>
          <div className="pb-4">
            <InputText
              name="sshHost"
              id="sshHost"
              label={{ text: 'Host*', className: 'min-w-[100px]' }}
              data-testid="sshHost"
              className="w-[256px]"
              color="secondary"
              maxLength={200}
              placeholder="Enter SSH Host"
              value={formik.values.sshHost ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                formik.setFieldValue(
                  e.target.name,
                  validateField(e.target.value.trim()),
                )
              }}
            />
          </div>

          <div>
            <InputText
              name="sshPort"
              id="sshPort"
              label={{ text: 'Port*', className: 'min-w-[100px]' }}
              data-testid="sshPort"
              className="w-[256px]"
              placeholder="Enter SSH Port"
              value={formik.values.sshPort ?? ''}
              maxLength={6}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                formik.setFieldValue(
                  e.target.name,
                  validatePortNumber(e.target.value.trim()),
                )
              }}
              onFocus={selectOnFocus}
              type="text"
              min={0}
              max={MAX_PORT_NUMBER}
            />
          </div>
        </div>

        <div>
          <div className={cx()}>
            <InputText
              name="sshUsername"
              id="sshUsername"
              data-testid="sshUsername"
              color="secondary"
              className="w-[256px]"
              label={{ text: 'Username*', className: 'min-w-[100px]' }}
              maxLength={200}
              placeholder="Enter SSH Username"
              value={formik.values.sshUsername ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                formik.setFieldValue(
                  e.target.name,
                  validateField(e.target.value.trim()),
                )
              }}
            />
          </div>
        </div>

        <div>
          <div className={cx(styles.sshPassTypeWrapper)}>
            <RadioGroup
              // id="sshPassType"
              // name="sshPassType"
              options={sshPassTypeOptions}
              idSelected={formik.values.sshPassType}
              // className={styles.sshPassType}
              onChange={(id) => {
                formik.setFieldValue('sshPassType', id)
              }}
              data-testid="ssh-pass-type"
            />
          </div>
        </div>

        {formik.values.sshPassType === SshPassType.Password && (
          <div>
            <div>
              <InputText
                type="password"
                name="sshPassword"
                id="sshPassword"
                data-testid="sshPassword"
                label={{ text: 'Password', className: 'min-w-[100px]' }}
                className="w-[256px]"
                maxLength={10_000}
                placeholder="Enter SSH Password"
                value={formik.values.sshPassword === true ? SECURITY_FIELD : formik.values.sshPassword ?? ''}
                onChange={formik.handleChange}
                onFocus={() => {
                  if (formik.values.sshPassword === true) {
                    formik.setFieldValue(
                      'sshPassword',
                      '',
                    )
                  }
                }}
                autoComplete="new-password"
              />
            </div>
          </div>
        )}

        {formik.values.sshPassType === SshPassType.PrivateKey && (
        <>
          <div>
            <div>
              <TextArea
                name="sshPrivateKey"
                id="sshPrivateKey"
                data-testid="sshPrivateKey"
                className="w-[256px]"
                label={{ text: 'Private Key*', className: 'min-w-[100px]' }}
                maxLength={50_000}
                placeholder="Enter SSH Private Key in PEM format"
                value={formik.values.sshPrivateKey === true ? SECURITY_FIELD : formik?.values?.sshPrivateKey?.replace(/./g, '•') ?? ''}
                onChange={formik.handleChange}
                onFocus={() => {
                  if (formik.values.sshPrivateKey === true) {
                    formik.setFieldValue(
                      'sshPrivateKey',
                      '',
                    )
                  }
                }}
              />
            </div>
          </div>
          <div>
            <div>
              <InputText
                type="password"
                name="sshPassphrase"
                id="sshPassphrase"
                label={{ text: 'Passphrase', className: 'min-w-[100px]' }}
                data-testid="sshPassphrase"
                className="w-[256px]"
                maxLength={50_000}
                placeholder="Enter Passphrase for Private Key"
                value={formik.values.sshPassphrase === true ? SECURITY_FIELD : formik.values.sshPassphrase ?? ''}
                onChange={formik.handleChange}
                onFocus={() => {
                  if (formik.values.sshPassphrase === true) {
                    formik.setFieldValue(
                      'sshPassphrase',
                      '',
                    )
                  }
                }}
                autoComplete="new-password"
              />
            </div>
          </div>
        </>
        )}
      </>
      )}
    </div>
  )
}

export { SSHDetails }
