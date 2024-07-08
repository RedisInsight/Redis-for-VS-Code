import React from 'react'
import parse from 'html-react-parser'

import { Checkbox, Spacer } from 'uiSrc/ui'
import { IConsent } from 'uiSrc/components'

export interface Props {
  consent: IConsent
  onChangeAgreement: (checked: boolean, name: string) => void
  checked: boolean
  isSettingsPage?: boolean
  withoutSpacer?: boolean
}

export const ConsentsOption = (props: Props) => {
  const {
    consent,
    onChangeAgreement,
    checked,
    isSettingsPage = false,
  } = props
  return (
    <div key={consent.agreementName}>
      {isSettingsPage && consent.description && (
        <>
          <div className="pt-3 pb-9">
            {parse(consent.description)}
          </div>
        </>
      )}
      <div className="flex flex-col items-start mb-4">
        <div>
          <Checkbox
            checked={checked}
            onChange={(e) => onChangeAgreement(e.target.checked, consent.agreementName)}
            data-testid={`check-option-${consent.agreementName}`}
            disabled={consent?.disabled}
            labelText={parse(consent.label)}
          />
        </div>
        {!isSettingsPage && consent.description && (
          <div className="pt-1 pl-[26px]">
            {parse(consent.description)}
          </div>
        )}
      </div>
    </div>
  )
}
