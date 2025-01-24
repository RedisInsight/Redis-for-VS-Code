import React from 'react'
import cx from 'classnames'
import { useShallow } from 'zustand/react/shallow'

import GoogleIcon from 'uiSrc/assets/oauth/google.svg?react'
import GithubIcon from 'uiSrc/assets/oauth/github.svg?react'
import SsoIcon from 'uiSrc/assets/oauth/sso.svg?react'
import { OAuthStrategy } from 'uiSrc/constants'
import { useOAuthStore } from 'uiSrc/store'
import { RiButton, Tooltip } from 'uiSrc/ui'
import styles from './styles.module.scss'

export interface Props {
  onClick: (authStrategy: OAuthStrategy) => void
  className?: string
  inline?: boolean
  disabled?: boolean
}

const OAuthSocialButtons = (props: Props) => {
  const { onClick, className, inline, disabled } = props

  const { agreement } = useOAuthStore(useShallow((state) => ({
    agreement: state.agreement,
  })))

  const socialLinks = [
    {
      text: 'Google',
      className: styles.googleButton,
      icon: GoogleIcon,
      label: 'google-oauth',
      strategy: OAuthStrategy.Google,
    },
    {
      text: 'Github',
      className: styles.githubButton,
      icon: GithubIcon,
      label: 'github-oauth',
      strategy: OAuthStrategy.GitHub,
    },
    {
      text: 'SSO',
      className: styles.ssoButton,
      icon: SsoIcon,
      label: 'sso-oauth',
      strategy: OAuthStrategy.SSO,
    },
  ]

  return (
    <div className={cx(styles.container, className)} data-testid="oauth-container-social-buttons">
      {socialLinks.map(({ strategy, text, icon: Icon, label, className = '' }) => (
        <Tooltip
          key={label}
          content={agreement ? null : 'Acknowledge the agreement'}
          data-testid={`${label}-tooltip`}
        >
          <>
            <RiButton
              disabled={!agreement || disabled}
              className={cx(styles.button, className, { [styles.inline]: inline })}
              onClick={() => {
                onClick(strategy)
              }}
              data-testid={label}
              aria-labelledby={label}
            >
              <Icon />
              <div className={styles.label}>{text}</div>
            </RiButton>
          </>
        </Tooltip>
      ))}
    </div>
  )
}

export default OAuthSocialButtons
