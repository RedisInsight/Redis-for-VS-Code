import React, { FC } from 'react'
import cx from 'classnames'
import { BarLoader, BeatLoader } from 'react-spinners'

import styles from './styles.module.scss'

interface Props {
  type: 'bar' | 'beat'
  loading: boolean
}

export const Spinner: FC<Props> = ({ type, loading }) => {
  switch (type) {
    case 'bar':
      return (
        <BarLoader
          loading={loading}
          className={cx(styles.bar)}
          color="var(--vscode-button-background)"
        />
      )

    case 'beat':
      return (
        <BeatLoader
          loading={loading}
          color="var(--vscode-button-background)"
        />
      )

    default:
      return (
        <BarLoader
          loading={loading}
          color="var(--vscode-button-background)"
        />
      )
  }
}
