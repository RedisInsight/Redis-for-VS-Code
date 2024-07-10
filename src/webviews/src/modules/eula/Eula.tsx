import React, { ReactElement, useEffect, useState } from 'react'
import { FormikErrors, useFormik } from 'formik'
import { isEmpty, forEach } from 'lodash'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscInfo } from 'react-icons/vsc'
import Popup from 'reactjs-popup'

import { compareConsents } from 'uiSrc/utils'
import { ConsentCategories, ConsentsOption, IConsent } from 'uiSrc/components'
import { updateUserConfigSettingsAction, useAppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import { Checkbox, CheckboxChangeEvent, Link, Separator, Spacer } from 'uiSrc/ui'
import LogoSvg from 'uiSrc/assets/logo.svg?react'
import { GetAppSettingsResponse } from 'uiSrc/store/hooks/use-app-info-store/interface'
import styles from './styles.module.scss'

interface Values {
  [key: string]: string;
}

export interface Props {
  onSubmitted?: (data: GetAppSettingsResponse) => void
}

export const Eula = ({ onSubmitted }: Props) => {
  const [consents, setConsents] = useState<IConsent[]>([])
  const [privacyConsents, setPrivacyConsents] = useState<IConsent[]>([])
  // const [notificationConsents, setNotificationConsents] = useState<IConsent[]>([])
  const [requiredConsents, setRequiredConsents] = useState<IConsent[]>([])
  const [initialValues, setInitialValues] = useState<any>({})
  const [errors, setErrors] = useState<FormikErrors<Values>>({})
  const [isRecommended, setIsRecommended] = useState<boolean>(false)
  const [valuesBuffer, setValuesBuffer] = useState<Values>({})

  const { spec, config } = useAppInfoStore((state) => ({
    config: state.config,
    spec: state.spec,
  }))

  const submitIsDisabled = () => !isEmpty(errors)

  const validate = (values: any) => {
    const errs: FormikErrors<any> = {}
    requiredConsents.forEach((consent) => {
      if (!values[consent.agreementName]) {
        errs[consent.agreementName] = consent.agreementName
      }
    })
    setErrors(errs)
    return errs
  }

  const selectAll = (e: CheckboxChangeEvent) => {
    setIsRecommended(e.target.checked)

    if (e.target.checked) {
      const newBufferValues:Values = {}
      consents.forEach((consent) => {
        if (!consent.required && !consent.disabled) {
          newBufferValues[consent.agreementName] = formik.values[consent.agreementName]
          formik.setFieldValue(consent.agreementName, true)
        }
        setValuesBuffer(newBufferValues)
      })
    } else {
      consents.forEach((consent) => {
        if (!consent.required && !consent.disabled) {
          formik.setFieldValue(consent.agreementName, valuesBuffer[consent.agreementName])
        }
      })
    }
  }

  const formik = useFormik({
    initialValues,
    validate,
    enableReinitialize: true,
    onSubmit: (values) => {
      submitForm(values)
    },
  })

  useEffect(() => {
    if (spec && config) {
      setConsents(compareConsents(spec?.agreements, config?.agreements))
    }
  }, [spec, config])

  useEffect(() => {
    if (!isRecommended) {
      setValuesBuffer({})
    }
  }, [isRecommended])

  useEffect(() => {
    setRequiredConsents(consents.filter(
      (consent: IConsent) => consent.required,
    ))
    setPrivacyConsents(consents.filter(
      (consent: IConsent) => !consent.required && consent.category === ConsentCategories.Privacy,
    ))
    // setNotificationConsents(consents.filter(
    //   (consent: IConsent) => !consent.required && consent.category === ConsentCategories.Notifications,
    // ))
    if (consents.length) {
      const values = consents.reduce(
        (acc: any, cur: IConsent) => ({ ...acc, [cur.agreementName]: cur.defaultValue }),
        {},
      )

      setInitialValues(values)
    }
  }, [consents])

  useEffect(() => {
    formik.validateForm(initialValues)
  }, [requiredConsents])

  useEffect(() => {
    setIsRecommended(checkIsRecommended())
  }, [formik.values])

  const checkIsRecommended = () => {
    let recommended = true
    forEach(privacyConsents, (consent) => {
      if (!formik.values[consent?.agreementName] && !consent.disabled) {
        recommended = false
        // return false
      }
    })

    // forEach(notificationConsents, (consent) => {
    //   if (!formik.values[consent?.agreementName] && !consent.disabled) {
    //     recommended = false
    //     // return false
    //   }
    // })

    return recommended
  }

  const onChangeAgreement = (checked: boolean, name: string) => {
    formik.setFieldValue(name, checked)
  }

  const submitForm = (values: any) => {
    if (submitIsDisabled()) {
      return
    }
    // have only one switcher in notificationConsents
    // if (notificationConsents.length) {
    //   sendEventTelemetry({
    //     event: values[notificationConsents[0]?.agreementName]
    //       ? TelemetryEvent.SETTINGS_NOTIFICATION_MESSAGES_ENABLED
    //       : TelemetryEvent.SETTINGS_NOTIFICATION_MESSAGES_DISABLED,
    //   })
    // }
    updateUserConfigSettingsAction({ agreements: values }, onSubmitted)
  }

  const SubmitBtn: ReactElement = (
    <VSCodeButton
      appearance="primary"
      disabled={submitIsDisabled()}
      onClick={formik.submitForm}
      data-testid="btn-submit"
    >
      {submitIsDisabled() && <VscInfo className="mr-2" />}
      {l10n.t('Submit')}
    </VSCodeButton>
  )

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        data-testid="consents-settings-form"
        className="h-[calc(100vh-60px)] overflow-auto"
      >
        <Spacer size="l" />
        <div className="flex flex-row items-center pb-4">
          <LogoSvg />
          <span className="pl-2 text-[26px]">{l10n.t('- EULA and Privacy settings')}</span>
        </div>
        <div className={styles.consentsWrapper}>
          <Separator />
          <Spacer />
          {consents.length > 1 && (
            <div>
              <div className="flex flex-col mb-4">
                <div className="flex grow-0">
                  <Checkbox
                    id="selectAll"
                    name="selectAll"
                    labelText={l10n.t('Use recommended settings')}
                    checked={isRecommended}
                    onChange={selectAll}
                    data-testid="switch-option-recommended"
                  />
                </div>
              </div>
              <Spacer size="xxs" />
            </div>
          )}
          <Separator />
          {!!privacyConsents.length && (
            <>
              <Spacer />
              <h2 className={styles.title}>{l10n.t('Privacy Settings')}</h2>
              <Spacer size="s" />
              <span className={styles.smallText}>
                {l10n.t(`To optimize your experience, Redis Insight uses third-party tools.
                All data collected is anonymized and will not be used for any purpose without your consent.`)}
              </span>
              <Spacer />
            </>
          )}
          {privacyConsents.map((consent: IConsent) => (
            <ConsentsOption
              consent={consent}
              checked={formik.values[consent.agreementName] ?? false}
              onChangeAgreement={onChangeAgreement}
              key={consent.agreementName}
            />
          ))}
          <Spacer />
          <Separator />
          <Spacer size="l" />
          {/* {!!notificationConsents.length && (
          <>
            <Spacer />
            <h3 className={styles.title}>{l10n.t('Notifications')}</h3>
            <Spacer />
          </>
        )} */}
          {/* {
          notificationConsents
            .map((consent: IConsent) => (
              <ConsentsOption
                consent={consent}
                checked={formik.values[consent.agreementName] ?? false}
                onChangeAgreement={onChangeAgreement}
                key={consent.agreementName}
              />
            ))
        } */}
        </div>
        {/* <div className="box px-4 w-screen bg-primary"> */}
        <div className="box px-4 bg-vscode-tab-unfocusedInactiveBackground">
          {requiredConsents.length ? (
            <>
              <Spacer />
              <span className={styles.smallText}>
                {l10n.t('To use Redis Insight, please accept the terms and conditions: ')}
                <Link
                  target="_blank"
                  href="https://github.com/RedisInsight/RedisInsight/blob/main/LICENSE"
                >
                  {l10n.t('Server Side Public License')}
                </Link>
              </span>
              <Spacer />
            </>
          ) : (
            <Spacer size="l" />
          )}

          <div className="items-center justify-between">
            <div className="flex grow-0">
              {requiredConsents.map((consent: IConsent) => (
                <ConsentsOption
                  consent={consent}
                  checked={formik.values[consent.agreementName] ?? false}
                  onChangeAgreement={onChangeAgreement}
                  key={consent.agreementName}
                />
              ))}
            </div>
          </div>
        </div>

      </form>
      <div className={styles.footer}>
        <div className="flex flex-grow">{l10n.t('Notice: To avoid automatic execution of malicious code, when adding new Workbench plugins, use files from trusted authors only.')}</div>
        <div className="flex">
          {!submitIsDisabled() && SubmitBtn}
          {submitIsDisabled() && (
            <Popup
              position="top center"
              on="hover"
              keepTooltipInside
              trigger={SubmitBtn}
              data-testid="modules-tooltip"
            >
              <span className="euiToolTip__content">
                {Object.values(errors).map((err) => [
                  spec?.agreements[err as string]?.requiredText,
                  <br key={err} />,
                ])}
              </span>
            </Popup>
          )}
        </div>
      </div>
    </>
  )
}
