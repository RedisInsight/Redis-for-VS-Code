import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import { has } from 'lodash'
import * as l10n from '@vscode/l10n'

import { compareConsents } from 'uiSrc/utils'
import { updateUserConfigSettingsAction, useAppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import { GetUserAgreementsResponse } from 'uiSrc/store/hooks/use-app-info-store/interface'
import { vscodeApi } from 'uiSrc/services'
import { VscodeMessageAction } from 'uiSrc/constants'
import { ConsentsOption } from 'uiSrc/components'

import { IConsent, ConsentCategories } from './interface'

export const ConsentsPrivacy = () => {
  const [consents, setConsents] = useState<IConsent[]>([])
  const [privacyConsents, setPrivacyConsents] = useState<IConsent[]>([])
  const [initialValues, setInitialValues] = useState<{ [key: string]: any }>({})

  const { spec, config } = useAppInfoStore((state) => ({
    config: state.config,
    spec: state.spec,
  }))

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: (values) => {
      submitForm(values)
    },
  })

  useEffect(() => {
    if (spec && config) {
      setConsents(compareConsents(spec?.agreements, config?.agreements, true))
    }
  }, [spec, config])

  useEffect(() => {
    setPrivacyConsents(consents.filter(
      (consent: IConsent) => !consent.required
        && consent.category === ConsentCategories.Privacy
        && consent.displayInSetting,
    ))
    if (consents.length) {
      const values = consents.reduce(
        (acc: any, cur: IConsent) => ({ ...acc, [cur.agreementName]: cur.defaultValue }),
        {},
      )

      if (config) {
        Object.keys(values).forEach((value) => {
          if (has(config.agreements, value)) {
            values[value] = config?.agreements?.[value as keyof GetUserAgreementsResponse]
          }
        })
      }
      setInitialValues(values)
    }
  }, [consents])

  const onChangeAgreement = (checked: boolean, name: string) => {
    formik.setFieldValue(name, checked)
    formik.submitForm()
  }

  const submitForm = (values: any) => {
    updateUserConfigSettingsAction({ agreements: values }, (data) => {
      vscodeApi.postMessage({ action: VscodeMessageAction.UpdateSettings, data })
    })
  }

  return (
    <div>
      <h3 className="font-extrabold text-[13px]">{l10n.t('Privacy')}</h3>
      <div className="py-9">
        {l10n.t('To optimize your experience, Redis for VSCode uses third-party tools. All data collected is anonymized and will not be used for any purpose without your consent.')}
      </div>
      <h4 className="font-bold text-[11px] uppercase">{l10n.t('Analytics')}</h4>
      {privacyConsents.map((consent: IConsent) => (
        <ConsentsOption
          consent={consent}
          checked={formik.values[consent.agreementName] ?? false}
          onChangeAgreement={onChangeAgreement}
          isSettingsPage
          key={consent.agreementName}
        />
      ))}
    </div>
  )
}
