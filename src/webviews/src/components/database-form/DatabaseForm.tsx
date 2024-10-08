import React, { ChangeEvent } from 'react'
import { FormikProps } from 'formik'
import * as l10n from '@vscode/l10n'
import cx from 'classnames'
import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react'

import {
  SECURITY_FIELD,
  MAX_PORT_NUMBER,
  MAX_TIMEOUT_NUMBER,
} from 'uiSrc/constants'
import {
  handlePasteHostName,
  selectOnFocus,
  validateField,
  validatePortNumber,
  validateTimeoutNumber,
} from 'uiSrc/utils'
import { DbConnectionInfo } from 'uiSrc/interfaces'
import { InputText } from 'uiSrc/ui'

import styles from './styles.module.scss'

interface IShowFields {
  alias: boolean
  host: boolean
  port: boolean
  timeout: boolean
}

export interface Props {
  formik: FormikProps<DbConnectionInfo>
  onHostNamePaste: (content: string) => boolean
  showFields: IShowFields
  isEditMode?: boolean
  autoFocus?: boolean
}

const DatabaseForm = (props: Props) => {
  const {
    formik,
    onHostNamePaste,
    autoFocus = false,
    showFields,
    isEditMode,
  } = props

  // const AppendHostName = () => (
  // <EuiToolTip
  //   title={(
  //     <div>
  //       <p>
  //         <b>Pasting a connection URL auto fills the database details.</b>
  //       </p>
  //       <p style={{ margin: 0, paddingTop: '10px' }}>
  //         The following connection URLs are supported:
  //       </p>
  //     </div>
  //   )}
  //   className="homePage_tooltip"
  //   anchorClassName="inputAppendIcon"
  //   position="right"
  //   content={(
  //     <ul className="homePage_toolTipUl">
  //       <li>
  //         <span className="dot" />
  //         redis://[[username]:[password]]@host:port
  //       </li>
  //       <li>
  //         <span className="dot" />
  //         rediss://[[username]:[password]]@host:port
  //       </li>
  //       <li>
  //         <span className="dot" />
  //         host:port
  //       </li>
  //     </ul>
  //   )}
  // >
  //   <EuiIcon type="iInCircle" style={{ cursor: 'pointer' }} />
  // </EuiToolTip>
  // )

  const DatabaseAlias = () => (
    <div className={cx('flex-1', { 'mr-6': !isEditMode })}>
      <InputText
        name="name"
        id="name"
        data-testid="name"
        label={{ text: l10n.t('Database Alias*'), className: 'min-w-[110px]' }}
        placeholder={l10n.t('Enter Database Alias')}
        onFocus={selectOnFocus}
        value={formik.values.name ?? ''}
        maxLength={500}
        onChange={formik.handleChange}
      />
    </div>
  )

  return (
    <div className={cx(styles.formContainer, { 'pt-5': isEditMode })}>
      <div className="flex">
        {showFields.alias && isEditMode && DatabaseAlias()}
      </div>
      <div className="flex">
        {showFields.host && (
          <div className="flex-1 mr-6">
            <InputText
              autoFocus={autoFocus}
              name="host"
              id="host"
              label={{ text: l10n.t('Host*'), className: 'min-w-[110px]' }}
              data-testid="host"
              color="secondary"
              maxLength={200}
              placeholder={l10n.t('Enter Hostname / IP address / Connection URL')}
              value={formik.values.host ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                formik.setFieldValue(
                  e.target.name,
                  validateField(e.target.value.trim()),
                )
              }}
              onPaste={(event: React.ClipboardEvent<HTMLInputElement>) => handlePasteHostName(onHostNamePaste, event as any)}
              onFocus={selectOnFocus}
            />
          </div>
        )}
        {showFields.port && (
          <div className={cx({ 'flex-1': isEditMode })}>
            <InputText
              name="port"
              id="port"
              data-testid="port"
              label={{ text: l10n.t('Port*'), className: 'min-w-[36px]' }}
              placeholder={l10n.t('Enter Port')}
              value={formik.values.port ?? ''}
              maxLength={6}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                formik.setFieldValue(
                  e.target.name,
                  validatePortNumber(e.target.value.trim()),
                )
              }}
              onFocus={selectOnFocus}
              min={0}
              max={MAX_PORT_NUMBER}
            />
          </div>
        )}
        {showFields.timeout && isEditMode && (
          <div className="flex-1 ml-2">
            <InputText
              name="timeout"
              id="timeout"
              data-testid="timeout"
              label={{ text: l10n.t('Timeout (s)'), className: 'min-w-[76px]' }}
              placeholder={l10n.t('Enter Timeout (in seconds)')}
              value={formik.values.timeout ?? ''}
              maxLength={7}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                formik.setFieldValue(
                  e.target.name,
                  validateTimeoutNumber(e.target.value.trim()),
                )
              }}
              onFocus={selectOnFocus}
              min={1}
              max={MAX_TIMEOUT_NUMBER}
            />
          </div>
        )}
      </div>

      {!isEditMode && (
        <div className="flex">
          {showFields.alias && DatabaseAlias()}
          {showFields.timeout && (
            <div>
              <InputText
                name="timeout"
                id="timeout"
                data-testid="timeout"
                label={{ text: l10n.t('Timeout (s)'), className: 'min-w-[76px]' }}
                placeholder={l10n.t('Enter Timeout (in seconds)')}
                value={formik.values.timeout ?? ''}
                maxLength={7}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validateTimeoutNumber(e.target.value.trim()),
                  )
                }}
                onFocus={selectOnFocus}
                min={1}
                max={MAX_TIMEOUT_NUMBER}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex">
        <div className="flex-1">
          <InputText
            name="username"
            id="username"
            label={{ text: l10n.t('Username'), className: !isEditMode ? 'min-w-[110px]' : '' }}
            data-testid="username"
            maxLength={200}
            placeholder={l10n.t('Enter Username')}
            value={formik.values.username ?? ''}
            onChange={formik.handleChange}
          />
        </div>

        <div className="flex-1">
          <InputText
            type="password"
            name="password"
            id="password"
            data-testid="password"
            label={{ text: l10n.t('Password'), className: 'ml-6' }}
            className="passwordField"
            maxLength={10_000}
            placeholder={l10n.t('Enter Password')}
            value={formik.values.password === true ? SECURITY_FIELD : formik.values.password ?? ''}
            onChange={formik.handleChange}
            onFocus={() => {
              if (formik.values.password === true) {
                formik.setFieldValue(
                  'password',
                  '',
                )
              }
            }}
            autoComplete="new-password"
          />
        </div>
      </div>
      <VSCodeDivider className="divider mt-2" />
    </div>
  )
}

export { DatabaseForm }
