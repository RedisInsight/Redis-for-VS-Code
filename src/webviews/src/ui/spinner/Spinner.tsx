import React, { FC } from 'react'
import cx from 'classnames'
import { BarLoader, BeatLoader, ClipLoader } from 'react-spinners'

import styles from './styles.module.scss'

export interface Props {
  type?: 'bar' | 'beat' | 'clip'
  loading?: boolean
  className?: string
}

export const Spinner: FC<Props> = ({ type, loading, className }) => {
  switch (type) {
    case 'bar':
      return (
        <BarLoader
          loading={loading}
          className={cx(styles.bar, className)}
          data-testid="bar-spinner"
          color="var(--vscode-button-background)"
        />
      )

    case 'beat':
      return (
        <BeatLoader
          loading={loading}
          className={cx(className)}
          data-testid="beat-spinner"
          color="var(--vscode-button-background)"
        />
      )

    case 'clip':
      return (
        <ClipLoader
          loading={loading}
          className={cx(className)}
          data-testid="clip-spinner"
          color="var(--vscode-button-background)"
        />
      )

    default:
      return (
        <BarLoader
          loading={loading}
          className={cx(className)}
          data-testid="bar-spinner"
          color="var(--vscode-button-background)"
        />
      )
  }
}
