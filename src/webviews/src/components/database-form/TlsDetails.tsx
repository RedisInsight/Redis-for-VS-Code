import React, { ChangeEvent, useId } from 'react'
import cx from 'classnames'
import { FormikProps } from 'formik'
import * as l10n from '@vscode/l10n'
import { CheckboxChangeEvent } from 'rc-checkbox'
import { find } from 'lodash'
import { MenuListProps } from 'react-select'

import { sendEventTelemetry, TelemetryEvent, validateCertName, validateField } from 'uiSrc/utils'
import {
  ADD_NEW,
  ADD_NEW_CA_CERT,
  ApiEndpoints,
  NO_CA_CERT,
} from 'uiSrc/constants'
import { DbConnectionInfo, RedisString } from 'uiSrc/interfaces'
import { Checkbox, InputText, TextArea } from 'uiSrc/ui'
import { removeCertAction } from 'uiSrc/store'
import { SuperSelectRemovableOption, SuperSelect, SuperSelectOption } from 'uiSrc/components'
import styles from './styles.module.scss'

const suffix = '_tls_details'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
  caCertificates?: { id: string, name: string }[]
  certificates?: { id: string, name: string }[]
}

const TlsDetails = (props: Props) => {
  const { formik, caCertificates, certificates } = props
  const id = useId()

  const handleDeleteCaCert = (id: RedisString, onSuccess?: () => void) => {
    removeCertAction(id, ApiEndpoints.CA_CERTIFICATES, () => {
      onSuccess?.()
      handleClickDeleteCert('CA')
    })
  }

  const handleDeleteClientCert = (id: RedisString, onSuccess?: () => void) => {
    removeCertAction(id, ApiEndpoints.CLIENT_CERTIFICATES, () => {
      onSuccess?.()
      handleClickDeleteCert('Client')
    })
  }

  const handleClickDeleteCert = (certificateType: 'Client' | 'CA') => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_CERTIFICATE_REMOVED,
      eventData: {
        certificateType,
      },
    })
  }

  const optionsCertsCA: SuperSelectOption[] = [
    NO_CA_CERT,
    ADD_NEW_CA_CERT,
  ]

  caCertificates?.forEach((cert) => {
    optionsCertsCA.push({
      value: cert.id,
      label: cert.name,
    })
  })

  const optionsCertsClient: SuperSelectOption[] = [ADD_NEW]

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
              <SuperSelect
                containerClassName="database-form-select w-[256px]"
                selectedOption={find(optionsCertsCA, { value: formik.values.selectedCaCertName }) as SuperSelectOption ?? NO_CA_CERT}
                options={optionsCertsCA}
                components={{ MenuList: (props: MenuListProps<SuperSelectOption, false>) => (
                  <SuperSelectRemovableOption
                    {...props}
                    suffix={suffix}
                    countDefaultOptions={2}
                    onDeleteOption={handleDeleteCaCert}
                  />
                ) }}
                onChange={(option) => {
                  formik.setFieldValue(
                    'selectedCaCertName',
                    option?.value || NO_CA_CERT?.value,
                  )
                }}
                testid="select-ca-cert"
              />
            </div>

            {formik.values.tls
              && formik.values.selectedCaCertName === ADD_NEW_CA_CERT.value && (
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
            && formik.values.selectedCaCertName === ADD_NEW_CA_CERT.value && (
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
              <SuperSelect
                containerClassName="database-form-select w-[256px]"
                selectedOption={find(optionsCertsClient, { value: formik.values.selectedTlsClientCertId }) as SuperSelectOption ?? ADD_NEW}
                options={optionsCertsClient}
                components={{ MenuList: (props: MenuListProps<SuperSelectOption, false>) => (
                  <SuperSelectRemovableOption
                    {...props}
                    countDefaultOptions={1}
                    suffix={suffix}
                    onDeleteOption={handleDeleteClientCert}
                  />
                ) }}
                onChange={(option) => {
                  formik.setFieldValue(
                    'selectedTlsClientCertId',
                    option?.value || ADD_NEW?.value,
                  )
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
