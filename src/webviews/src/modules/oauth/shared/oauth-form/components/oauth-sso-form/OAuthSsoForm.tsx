import { isEmpty } from 'lodash'
import React, { ChangeEvent, useState } from 'react'
import { FormikErrors, useFormik } from 'formik'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscInfo } from 'react-icons/vsc'

import { validateEmail, validateField } from 'uiSrc/utils'
import { InputText, Spacer, Tooltip } from 'uiSrc/ui'
import styles from './styles.module.scss'

export interface Props {
  onBack: () => void,
  onSubmit: (values: { email: string }) => any,
}

interface Values {
  email: string;
}

const OAuthSsoForm = ({
  onBack,
  onSubmit,
}: Props) => {
  const [validationErrors, setValidationErrors] = useState<FormikErrors<Values>>({ email: '' })

  const validate = (values: Values) => {
    const errs: FormikErrors<Values> = {}

    if (!values?.email || !validateEmail(values.email)) {
      errs.email = l10n.t('Invalid email')
    }

    setValidationErrors(errs)

    return errs
  }

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validate,
    onSubmit,
  })

  const submitIsDisabled = () => !isEmpty(validationErrors)

  const SubmitButton = ({
    text,
    disabled,
  }: { disabled: boolean, text: string }) => (
    <Tooltip
      data-testid="btn-submit-tooltip"
      content={disabled ? (
        <>
          <p>{l10n.t('Email must be in the format')}</p>
          <p>{l10n.t('email@example.com without spaces')}</p>
        </>
      ) : null}
    >
      <VSCodeButton
        appearance="primary"
        onClick={() => onSubmit(formik.values)}
        disabled={disabled}
        data-testid="btn-submit"
      >
        {disabled && <VscInfo className="mr-1" />}
        {text}
      </VSCodeButton>
    </Tooltip>
  )

  return (
    <div className={styles.container} data-testid="oauth-container-sso-form">
      <div className={styles.title}><h4>{l10n.t('Single Sign-On')}</h4></div>
      <form onSubmit={formik.handleSubmit}>
        <div className="flex flex-col">
          <span>{l10n.t('Email')}</span>
          <InputText
            name="email"
            id="sso-email"
            data-testid="sso-email"
            maxLength={200}
            value={formik.values.email}
            autoComplete="off"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              formik.setFieldValue(e.target.name, validateField(e.target.value.trim()))
            }}
          />
        </div>
        <Spacer />
        <div className="flex justify-end">
          <VSCodeButton
            appearance="secondary"
            onClick={onBack}
            className="mr-4"
            data-testid="btn-back"
          >
            {l10n.t('Back')}
          </VSCodeButton>
          <SubmitButton
            text="Login"
            disabled={submitIsDisabled()}
          />
        </div>
      </form>
    </div>
  )
}

export default OAuthSsoForm
