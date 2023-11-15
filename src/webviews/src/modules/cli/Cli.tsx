import React from 'react'

import { CliBodyWrapper } from './components/cli-body'
import styles from './styles.module.scss'

export const Cli = () => (
  <div className={styles.container} data-testid="cli">
    <div className={styles.main}>
      <CliBodyWrapper />
    </div>
  </div>
)
