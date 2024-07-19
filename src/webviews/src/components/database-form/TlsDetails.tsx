import React, { ChangeEvent, useId } from 'react'
import cx from 'classnames'
import { FormikProps } from 'formik'
import * as l10n from '@vscode/l10n'
import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react'
import { CheckboxChangeEvent } from 'rc-checkbox'

import { validateCertName, validateField } from 'uiSrc/utils'
import {
  ADD_NEW,
  ADD_NEW_CA_CERT,
  ADD_NEW_CA_CERT_LABEL,
  ADD_NEW_LABEL,
  NO_CA_CERT,
  NO_CA_CERT_LABEL,
} from 'uiSrc/constants'
import { DbConnectionInfo } from 'uiSrc/interfaces'
import { Checkbox, InputText, Select, TextArea } from 'uiSrc/ui'
import styles from './styles.module.scss'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
  caCertificates?: { id: string, name: string }[]
  certificates?: { id: string, name: string }[]
}
const TlsDetails = (props: Props) => {
  const { formik, caCertificates, certificates } = props
  const id = useId()

  const optionsCertsCA = [
    {
      value: NO_CA_CERT,
      label: NO_CA_CERT_LABEL,
    },
    {
      value: ADD_NEW_CA_CERT,
      label: ADD_NEW_CA_CERT_LABEL,
    },
  ]

  caCertificates?.forEach((cert) => {
    optionsCertsCA.push({
      value: cert.id,
      label: cert.name,
    })
  })

  const optionsCertsClient = [
    {
      value: ADD_NEW,
      label: ADD_NEW_LABEL,
    },
  ]

  certificates?.forEach((cert) => {
    optionsCertsClient.push({
      value: `${cert.id}`,
      label: cert.name,
    })
  })

  return (
    <>
      <div>
        <div>
          <Checkbox
            id={`${id} over ssl`}
            name="tls"
            labelText={l10n.t('Use TLS')}
            checked={!!formik.values.tls}
            onChange={(e) => formik.setFieldValue('tls', e.target.checked)}
            data-testid="tls"
          />
        </div>

        {formik.values.tls && (
          <>
            <div>
              <Checkbox
                id={`${id} sni`}
                name="sni"
                labelText={l10n.t('Use SNI')}
                checked={!!formik.values.sni}
                onChange={(e: CheckboxChangeEvent) => {
                  formik.setFieldValue(
                    'servername',
                    formik.values.servername ?? formik.values.host ?? '',
                  )
                  formik.setFieldValue('sni', e.target.checked)
                }}
                data-testid="sni"
              />
            </div>
            {formik.values.sni && (
              <div className="mb-3">
                <InputText
                  name="servername"
                  id="servername"
                  label={{ text: l10n.t('Server Name*'), className: 'min-w-[100px]' }}
                  maxLength={200}
                  className="w-[256px]"
                  placeholder={l10n.t('Enter Server Name')}
                  value={formik.values.servername ?? ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    formik.setFieldValue(
                      e.target.name,
                      validateField(e.target.value.trim()),
                    )}
                  data-testid="sni-servername"
                />
              </div>
            )}
            <div className={cx({ [styles.fullWidth]: formik.values.sni })}>
              <Checkbox
                id={`${id} verifyServerTlsCert`}
                name="verifyServerTlsCert"
                labelText={l10n.t('Verify TLS Certificate')}
                checked={!!formik.values.verifyServerTlsCert}
                onChange={(e) => formik.setFieldValue('verifyServerTlsCert', e.target.checked)}
                data-testid="verify-tls-cert"
              />
            </div>
          </>
        )}
      </div>
      {formik.values.tls && (
        <div className="boxSection">
          <div>
            <div className="flex items-center pb-3">
              <div className="w-[100px]">
                {`${l10n.t('CA Certificate')}${formik.values.verifyServerTlsCert ? '*' : ''}`}
              </div>
              <Select
                // name="selectedCaCertName"
                // placeholder="Select CA certificate"
                containerClassName="database-form-select w-[256px]"
                itemClassName="database-form-select__option"
                idSelected={formik.values.selectedCaCertName ?? NO_CA_CERT}
                options={optionsCertsCA}
                onChange={(value) => {
                  formik.setFieldValue(
                    'selectedCaCertName',
                    value || NO_CA_CERT,
                  )
                }}
                testid="select-ca-cert"
              />
            </div>

            {formik.values.tls
              && formik.values.selectedCaCertName === ADD_NEW_CA_CERT && (
                <div className="mb-3">
                  <InputText
                    name="newCaCertName"
                    id="newCaCertName"
                    label={{ text: l10n.t('Name*'), className: 'min-w-[100px]' }}
                    maxLength={200}
                    className="w-[256px]"
                    placeholder={l10n.t('Enter CA Certificate Name')}
                    value={formik.values.newCaCertName ?? ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      formik.setFieldValue(
                        e.target.name,
                        validateCertName(e.target.value),
                      )}
                    data-testid="qa-ca-cert"
                  />
                </div>
            )}
          </div>

          {formik.values.tls
            && formik.values.selectedCaCertName === ADD_NEW_CA_CERT && (
            <div>
              <TextArea
                name="newCaCert"
                id="newCaCert"
                className="w-[256px]"
                label={{ text: l10n.t('Certificate*'), className: 'min-w-[100px]' }}
                value={formik.values.newCaCert ?? ''}
                onChange={formik.handleChange}
                placeholder={l10n.t('Enter CA Certificate')}
                data-testid="new-ca-cert"
              />
            </div>
          )}
        </div>
      )}
      {formik.values.tls && (
        <div>
          <Checkbox
            id={`${id} is_tls_client_auth_required`}
            name="tlsClientAuthRequired"
            labelText={l10n.t('Requires TLS Client Authentication')}
            checked={!!formik.values.tlsClientAuthRequired}
            onChange={(e) => formik.setFieldValue('tlsClientAuthRequired', e.target.checked)}
            data-testid="tls-required-checkbox"
          />
        </div>
      )}
      {formik.values.tls && formik.values.tlsClientAuthRequired && (
        <div className={cx('boxSection', styles.tslBoxSection)}>
          <div>
            <div className="flex items-center pb-3">
              <div className="w-[100px]">{l10n.t('Client Certificate*')}</div>
              <Select
                containerClassName="database-form-select w-[256px]"
                itemClassName="database-form-select__option"
                options={optionsCertsClient}
                idSelected={formik.values.selectedTlsClientCertId ?? ADD_NEW}
                onChange={(value) => {
                  formik.setFieldValue('selectedTlsClientCertId', value)
                }}
                testid="select-cert"
              />
            </div>

            {formik.values.tls
              && formik.values.tlsClientAuthRequired
              && formik.values.selectedTlsClientCertId === 'ADD_NEW' && (
                <div className="pb-3">
                  <InputText
                    name="newTlsCertPairName"
                    label={{ text: l10n.t('Name*'), className: 'min-w-[100px]' }}
                    id="newTlsCertPairName"
                    className="w-[256px]"
                    maxLength={200}
                    placeholder={l10n.t('Enter Client Certificate Name')}
                    value={formik.values.newTlsCertPairName ?? ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      formik.setFieldValue(
                        e.target.name,
                        validateCertName(e.target.value),
                      )}
                    data-testid="new-tsl-cert-pair-name"
                  />
                </div>
            )}
          </div>

          {formik.values.tls
            && formik.values.tlsClientAuthRequired
            && formik.values.selectedTlsClientCertId === 'ADD_NEW' && (
              <>
                <div className="pb-3">
                  <TextArea
                    name="newTlsClientCert"
                    id="newTlsClientCert"
                    label={{ text: l10n.t('Certificate*'), className: 'min-w-[100px]' }}
                    value={formik.values.newTlsClientCert}
                    className="w-[256px]"
                    onChange={formik.handleChange}
                    draggable={false}
                    placeholder={l10n.t('Enter Client Certificate')}
                    data-testid="new-tls-client-cert"
                  />
                </div>

                <div className="mb-3">
                  <TextArea
                    placeholder={l10n.t('Enter Private Key')}
                    name="newTlsClientKey"
                    id="newTlsClientKey"
                    className="w-[256px]"
                    label={{ text: l10n.t('Private Key*'), className: 'min-w-[100px]' }}
                    value={formik.values.newTlsClientKey}
                    onChange={formik.handleChange}
                    data-testid="new-tls-client-cert-key"
                  />
                </div>
              </>
          )}
        </div>
      )}
    </>
  )
}

export { TlsDetails }
