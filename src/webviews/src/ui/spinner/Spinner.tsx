import React, { FC } from 'react'
import cx from 'classnames'
import { BarLoader, BeatLoader, ClipLoader } from 'react-spinners'
import { LengthType } from 'react-spinners/helpers/props'

import styles from './styles.module.scss'

export interface Props {
  type?: 'bar' | 'beat' | 'clip'
  loading?: boolean
  className?: string
  size?: LengthType
}

export const Spinner: FC<Props> = ({ type, loading, className, size }) => {
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
          size={size}
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
