/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { FormikErrors, useFormik } from 'formik'
import { isEmpty, pick } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import Popup from 'reactjs-popup'
import { VSCodeButton, VSCodeDivider } from '@vscode/webview-ui-toolkit/react'

import { VscInfo } from 'react-icons/vsc'
import {
  Keys,
  validationErrors,
  fieldDisplayNames,
  SubmitBtnText,
  ConnectionType,
} from 'uiSrc/constants'
import { DbConnectionInfo, ISubmitButton } from 'uiSrc/interfaces'
import { getFormErrors, getRequiredFieldsText } from 'uiSrc/utils'
import {
  DbIndex,
  DbInfo,
  MessageStandalone,
  TlsDetails,
  DatabaseForm,
  DbCompressor,
  SSHDetails,
} from 'uiSrc/components'
import { useCertificatesStore } from 'uiSrc/store'

export interface Props {
  formFields: DbConnectionInfo
  submitButtonText?: string
  loading: boolean
  isEditMode?: boolean
  isCloneMode: boolean
  setIsCloneMode: (value: boolean) => void
  onSubmit: (values: DbConnectionInfo) => void
  onHostNamePaste: (content: string) => boolean
  onClose?: () => void
}

const getInitFieldsDisplayNames = ({ host, port, name }: any) => {
  if (!host || !port || !name) {
    return pick(fieldDisplayNames, ['host', 'port', 'name'])
  }
  return {}
}

const ManualConnectionForm = (props: Props) => {
  const {
    formFields,
    onClose,
    onSubmit,
    onHostNamePaste,
    submitButtonText,
    // loading,
    isEditMode,
    isCloneMode,
    setIsCloneMode,
  } = props

  const {
    id,
    host,
    name,
    port,
    db = null,
    nameFromProvider,
    sentinelMaster,
    connectionType,
    nodes = null,
    modules,
    provider,
  } = formFields

  const { caCerts, clientCerts } = useCertificatesStore((state) => ({
    caCerts: state.caCerts,
    clientCerts: state.clientCerts,
  }))

  const [errors, setErrors] = useState<FormikErrors<DbConnectionInfo>>(
    getInitFieldsDisplayNames({ host, port, name }),
  )

  const formRef = useRef<HTMLDivElement>(null)

  const submitIsDisable = () => !isEmpty(errors)

  const validate = (values: DbConnectionInfo) => {
    const errs = getFormErrors(values)

    if (isCloneMode && connectionType === ConnectionType.Sentinel && !values.sentinelMasterName) {
      errs.sentinelMasterName = fieldDisplayNames.sentinelMasterName
    }

    if (!values.name) {
      errs.name = fieldDisplayNames.name
    }

    setErrors(errs)
    return errs
  }

  const formik = useFormik({
    initialValues: formFields,
    validate,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: (values: any) => {
      onSubmit(values)
    },
  })

  const onKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key.toLowerCase() === Keys.ENTER && !submitIsDisable()) {
      // event.
      formik.submitForm()
    }
  }

  // useEffect(() =>
  // // componentWillUnmount
  //   () => {
  //     if (isEditMode) {
  //       dispatch(resetInstanceUpdateAction())
  //     }
  //   },
  // [])

  useEffect(() => {
    formik.resetForm()
  }, [isCloneMode])

  const handleTestConnectionDatabase = () => {
    // onTestConnection(formik.values)
  }

  const SubmitButton = ({
    text = '',
    onClick,
    submitIsDisabled,
  }: ISubmitButton) => {
    const Btn = (
      <VSCodeButton
        onClick={onClick}
        disabled={submitIsDisabled}
        // isLoading={loading}
        data-testid="btn-submit"
      >
        <>
          {submitIsDisabled && <VscInfo className="mr-1" />}
          {text}
        </>
      </VSCodeButton>
    )

    return !submitIsDisabled
      ? Btn
      : (
        <Popup
          position="top center"
          trigger={Btn}
          on="hover"
        >
          {getRequiredFieldsText(errors)}
        </Popup>
      )
  }

  const Footer = () => {
    const footerEl = document.getElementById('footerDatabaseForm')

    if (footerEl) {
      return ReactDOM.createPortal(
        <div
          className="footerAddDatabase"
        >
          <div className="btn-back">
            {/* <EuiToolTip
              position="top"
              anchorClassName="euiToolTip__btn-disabled"
              title={
                submitIsDisable()
                  ? validationErrors.REQUIRED_TITLE(Object.keys(errors).length)
                  : null
              }
              content={getSubmitButtonContent(errors, submitIsDisable())}
            >
              <EuiButton
                className="empty-btn"
                onClick={handleTestConnectionDatabase}
                disabled={submitIsDisable()}
                isLoading={loading}
                iconType={submitIsDisable() ? 'iInCircle' : undefined}
                data-testid="btn-test-connection"
              >
                Test Connection
              </EuiButton>
            </EuiToolTip> */}
          </div>

          <div>
            <SubmitButton
              onClick={formik.submitForm}
              text={submitButtonText}
              submitIsDisabled={submitIsDisable()}
            />
          </div>
        </div>,
        footerEl,
      )
    }
    return null
  }

  return (
    <div className="relative">
      {isEditMode && name && (
        <div className="fluid" style={{ marginBottom: 15 }}>
          {/* <DatabaseAlias
            isRediStack={isRediStack(modules, version)}
            isCloneMode={isCloneMode}
            alias={name}
            database={db}
            isLoading={loading}
            id={id}
            provider={provider}
            modules={modules}
            setIsCloneMode={setIsCloneMode}
            onAliasEdited={onAliasEdited}
          /> */}
        </div>
      )}
      <div className="getStartedForm" ref={formRef}>
        {/* {!isEditMode && (
          <>
            <MessageStandalone />
            <br />
          </>
        )} */}
        {!isEditMode && (
          <form
            onSubmit={formik.handleSubmit}
            data-testid="form"
            onKeyDown={onKeyDown}
          >
            <DatabaseForm
              formik={formik}
              onHostNamePaste={onHostNamePaste}
              showFields={{ host: true, alias: true, port: true, timeout: true }}
            />
            <DbIndex
              formik={formik}
            />
            <DbCompressor
              formik={formik}
            />
            <TlsDetails
              formik={formik}
              certificates={clientCerts}
              caCertificates={caCerts}
            />
            <SSHDetails
              formik={formik}
            />
          </form>
        )}
        {(isEditMode || isCloneMode) && connectionType !== ConnectionType.Sentinel && (
          <>
            {!isCloneMode && (
              <DbInfo
                host={host}
                port={port}
                connectionType={connectionType}
                db={db}
                modules={modules}
                nameFromProvider={nameFromProvider}
                nodes={nodes}
              />
            )}
            <form
              onSubmit={formik.handleSubmit}
              data-testid="form"
              onKeyDown={onKeyDown}
            >
              <DatabaseForm
                isEditMode
                formik={formik}
                showFields={{
                  alias: !isEditMode || isCloneMode,
                  host: (!isEditMode || isCloneMode),
                  port: true,
                  timeout: true,
                }}
                autoFocus={!isCloneMode && isEditMode}
                onHostNamePaste={onHostNamePaste}
              />
              {isCloneMode && (
                <DbIndex
                  formik={formik}
                />
              )}
              <DbCompressor
                formik={formik}
              />
              <TlsDetails
                formik={formik}
                certificates={clientCerts}
                caCertificates={caCerts}
              />
              <SSHDetails
                formik={formik}
              />
            </form>
          </>
        )}
        {/* {(isEditMode || isCloneMode) && connectionType === ConnectionType.Sentinel && (
          <>
            <form
              onSubmit={formik.handleSubmit}
              data-testid="form"
              onKeyDown={onKeyDown}
            >
              {!isCloneMode && (
                <>
                  <DbInfoSentinel
                    nameFromProvider={nameFromProvider}
                    connectionType={connectionType}
                    sentinelMaster={sentinelMaster}
                  />
                  <EuiCollapsibleNavGroup
                    title="Database"
                    isCollapsible
                    initialIsOpen={false}
                    data-testid="database-nav-group"
                  >
                    <SentinelMasterDatabase
                      formik={formik}
                      db={db}
                      isCloneMode={isCloneMode}
                    />
                  </EuiCollapsibleNavGroup>
                  <EuiCollapsibleNavGroup
                    title="Sentinel"
                    isCollapsible
                    initialIsOpen={false}
                    data-testid="sentinel-nav-group"
                  >
                    <SentinelHostPort
                      host={host}
                      port={port}
                    />
                    <DatabaseForm
                      formik={formik}
                      showFields={{ host: false, port: true, alias: false, timeout: false }}
                      onHostNamePaste={onHostNamePaste}
                    />
                  </EuiCollapsibleNavGroup>
                  <EuiCollapsibleNavGroup
                    title="TLS Details"
                    isCollapsible
                    initialIsOpen={false}
                  >
                    <TlsDetails
                      formik={formik}
                      certificates={clientCerts}
                      caCertificates={caCerts}
                    />
                  </EuiCollapsibleNavGroup>
                </>
              )}
              {isCloneMode && (
                <>
                  <PrimaryGroupSentinel
                    formik={formik}
                  />
                  <EuiCollapsibleNavGroup
                    title="Database"
                    isCollapsible
                    initialIsOpen={false}
                    data-testid="database-nav-group-clone"
                  >
                    <SentinelMasterDatabase
                      formik={formik}
                      db={db}
                      isCloneMode={isCloneMode}
                    />
                  </EuiCollapsibleNavGroup>
                  <EuiCollapsibleNavGroup
                    title="Sentinel"
                    isCollapsible
                    initialIsOpen={false}
                    data-testid="sentinel-nav-group-clone"
                  >
                    <DatabaseForm
                      formik={formik}
                      showFields={{ host: true, port: true, alias: false, timeout: false }}
                      onHostNamePaste={onHostNamePaste}
                    />
                  </EuiCollapsibleNavGroup>
                  <EuiSpacer size="m" />
                  <DbIndex
                    formik={formik}
                  />
                  <DbCompressor
                    formik={formik}
                  />
                  <TlsDetails
                    formik={formik}
                    certificates={clientCerts}
                    caCertificates={caCerts}
                  />
                </>
              )}
            </form>
          </>
        )} */}
      </div>
      <VSCodeDivider className="divider" />
      <Footer />
    </div>
  )
}

export { ManualConnectionForm }
