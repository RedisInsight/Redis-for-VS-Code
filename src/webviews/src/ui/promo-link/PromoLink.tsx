import React, { FunctionComponent, SVGProps } from 'react'
import cx from 'classnames'

import { ContentFeatureCreateRedis } from 'uiSrc/store/hooks/use-app-info-store/interface'
import styles from './styles.module.scss'

export interface Props extends ContentFeatureCreateRedis {
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  testId?: string
  className?: string
  Icon?: FunctionComponent<SVGProps<SVGSVGElement>>
  styles?: any
}

export const PromoLink = (props: Props) => {
  const { title, description, links, onClick, testId, Icon, styles: linkStyles, className = '' } = props

  return (
    <a
      className={cx(styles.link, className)}
      href={links?.main.url}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      data-testid={testId}
      style={{ ...linkStyles }}
    >
      {!!Icon && <div className="mr-0.5"><Icon className="w-[18px] h-[18px] mr-1" /></div>}
      <div className="flex flex-col">
        {title && (
          <div className={styles.title}>
            <span>{title}</span>
          </div>
        )}
        {description && (
          <div className={styles.description}>
            <span>{description}</span>
          </div>
        )}
      </div>
    </a>
  )
}
