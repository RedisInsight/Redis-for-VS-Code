import React from 'react'

import CliBodyWrapper from 'uiSrc/components/cli/components/cli-body'
import styles from './styles.module.scss'

const Cli = () => (
  <div className={styles.container} data-testid="cli">
    <div className={styles.main}>
      <CliBodyWrapper />
    </div>
  </div>
)

export default Cli
