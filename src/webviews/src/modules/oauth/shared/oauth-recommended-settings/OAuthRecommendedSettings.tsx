import React from 'react'
import { VscInfo } from 'react-icons/vsc'
import * as l10n from '@vscode/l10n'

import { Checkbox, Tooltip } from 'uiSrc/ui'
import styles from './styles.module.scss'

export interface Props {
  value?: boolean
  onChange: (value: boolean) => void
}

const OAuthRecommendedSettings = (props: Props) => {
  const { value, onChange } = props

  return (
  // TODO: feature flag for sso
  // <FeatureFlagComponent name={FeatureFlags.cloudSsoRecommendedSettings}>
    <div className={styles.recommendedSettings}>
      <Checkbox
        // TODO: custom region
        disabled
        id="ouath-recommended-settings"
        name="recommended-settings"
        labelText={l10n.t('Use a pre-selected provider and region')}
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        data-testid="oauth-recommended-settings-checkbox"
      />
      <Tooltip
        content={(
          <>
            {l10n.t('The database will be automatically created using a pre-selected provider and region.')}
            <br />
            {l10n.t('You can change it by signing in to Redis Cloud.')}
          </>
        )}
      >
        <div className="pl-1 cursor-pointer"><VscInfo /></div>
      </Tooltip>
    </div>
  // </FeatureFlagComponent>
  )
}

export default OAuthRecommendedSettings
