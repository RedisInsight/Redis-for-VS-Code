import React, { FC } from 'react'
import cx from 'classnames'
import { BarLoader, BeatLoader } from 'react-spinners'

import styles from './styles.module.scss'

export interface Props {
  type?: 'bar' | 'beat'
  loading?: boolean
}

export const Spinner: FC<Props> = ({ type, loading }) => {
  switch (type) {
    case 'bar':
      return (
        <BarLoader
          loading={loading}
          className={cx(styles.bar)}
          data-testid="bar-spinner"
          color="var(--vscode-button-background)"
        />
      )

    case 'beat':
      return (
        <BeatLoader
          loading={loading}
          data-testid="beat-spinner"
          color="var(--vscode-button-background)"
        />
      )

    default:
      return (
        <BarLoader
          loading={loading}
          data-testid="bar-spinner"
          color="var(--vscode-button-background)"
        />
      )
  }
}
