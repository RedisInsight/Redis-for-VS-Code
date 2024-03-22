import React from 'react'
import parse from 'html-react-parser'

import { Checkbox } from 'uiSrc/ui'
import { IConsent } from '../interface'

import styles from '../styles.module.scss'

export interface Props {
  consent: IConsent
  onChangeAgreement: (checked: boolean, name: string) => void
  checked: boolean
  isSettingsPage?: boolean
  withoutSpacer?: boolean
}

export const ConsentOption = (props: Props) => {
  const {
    consent,
    onChangeAgreement,
    checked,
    isSettingsPage = false,
    withoutSpacer = false,
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
      <div className="flex flex-row items-center">
        <div>
          <Checkbox
            checked={checked}
            onChange={(e) => onChangeAgreement(e.target.checked, consent.agreementName)}
            className={styles.switchOption}
            data-testid={`check-option-${consent.agreementName}`}
            disabled={consent?.disabled}
            labelText={parse(consent.label)}
          />
        </div>
        {!isSettingsPage && consent.description && (
          <div>
            {parse(consent.description)}
          </div>
        )}
      </div>
    </div>
  )
}
