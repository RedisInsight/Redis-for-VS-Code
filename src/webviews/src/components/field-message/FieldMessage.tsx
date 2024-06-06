import React, { Ref, useEffect, useRef } from 'react'
import cx from 'classnames'

import { scrollIntoView } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  children: React.ReactElement | string;
  scrollViewOnAppear?: boolean;
  testID?: string,
  Icon?: React.ReactElement,
}

export const FieldMessage = ({ children, testID, Icon, scrollViewOnAppear }: Props) => {
  const divRef: Ref<HTMLDivElement> = useRef(null)

  useEffect(() => {
    // componentDidMount
    if (scrollViewOnAppear) {
      scrollIntoView(divRef?.current, {
        behavior: 'smooth',
        block: 'nearest',
        inline: 'end',
      })
    }
  }, [])

  return (
    <div ref={divRef} className={cx(styles.container)}>
      {Icon && (
        <div className={cx(styles.icon)}>{Icon}</div>
      )}
      <div
        className={cx(styles.message)}
        data-testid={testID}
      >
        {children}
      </div>
    </div>
  )
}
