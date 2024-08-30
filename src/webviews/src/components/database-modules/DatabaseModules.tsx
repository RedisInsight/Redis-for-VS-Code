import React from 'react'
import cx from 'classnames'
import Popup from 'reactjs-popup'
import SVG from 'react-inlinesvg'

import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { IDatabaseModule, sortModules, truncateText, getModule } from 'uiSrc/utils'

import Unknown from 'uiSrc/assets/modules/Unknown.svg'

import { AdditionalRedisModule, RedisDefaultModules } from 'uiSrc/interfaces'
import { DEFAULT_MODULES_INFO } from 'uiSrc/constants'
import styles from './styles.module.scss'

export interface Props {
  content?: JSX.Element
  modules: AdditionalRedisModule[]
  inCircle?: boolean
  dark?: boolean
  highlight?: boolean
  maxViewModules?: number
  tooltipTitle?: React.ReactNode
  withoutStyles?: boolean
}

const DatabaseModules = React.memo((props: Props) => {
  const { content, modules, inCircle, highlight, tooltipTitle, maxViewModules, withoutStyles } = props

  const mainContent: IDatabaseModule[] = []

  const handleCopy = (text = '') => {
    navigator?.clipboard?.writeText(text)
  }

  const newModules: IDatabaseModule[] = sortModules(modules?.map(({ name: propName, semanticVersion = '', version = '' }) => {
    const moduleName = DEFAULT_MODULES_INFO[propName as RedisDefaultModules]?.text || propName

    const { abbreviation = '', name = moduleName } = getModule(moduleName)

    const moduleAlias = truncateText(name, 50)
    let icon = DEFAULT_MODULES_INFO[propName as RedisDefaultModules]?.icon
    const content = `${moduleAlias}${semanticVersion || version ? ` v. ${semanticVersion || version}` : ''}`

    if (!icon && !abbreviation) {
      icon = Unknown
    }

    mainContent.push({ icon, content, abbreviation, moduleName })

    return {
      moduleName,
      icon,
      abbreviation,
      content,
    }
  }))

  // set count of hidden modules
  if (maxViewModules && newModules.length > maxViewModules + 1) {
    newModules.length = maxViewModules
    newModules.push({
      icon: null,
      content: '',
      moduleName: '',
      abbreviation: `+${modules.length - maxViewModules}`,
    })
  }

  const Content = sortModules(mainContent).map(({ icon, content, abbreviation = '' }) => (
    <div className={styles.tooltipItem} key={content || abbreviation}>
      {!!icon && (<SVG src={icon} width={16} height={16} />)}
      {!icon && (
        <div
          className={cx(styles.icon, styles.abbr)}
          style={{ marginRight: 10 }}
        >
          {abbreviation}
        </div>
      )}
      {!!content && (<div className={cx(styles.tooltipItemText)}>{content}</div>)}
      <br />
    </div>
  ))

  const Module = (moduleName: string = '', abbreviation: string = '', icon: string, content: string = '') => (
    <span key={moduleName || abbreviation || content}>
      {icon ? (
        <VSCodeButton
          appearance="icon"
          className={cx(styles.icon, { [styles.circle]: inCircle })}
          onClick={() => handleCopy(content)}
          data-testid={`${content}_module`}
          aria-labelledby={`${content}_module`}
        >
          <SVG src={icon} width={16} height={16} />
        </VSCodeButton>

      ) : (
        <div
          className={cx(styles.icon, styles.abbr, { [styles.circle]: inCircle })}
          onClick={() => handleCopy(content)}
          data-testid={`${content}_module`}
          role="button"
          aria-hidden="true"
          aria-labelledby={`${content}_module`}
        >
          {abbreviation}
        </div>
      )}
    </span>
  )

  const Modules = () => (
    newModules.map(({ icon, content, abbreviation, moduleName }, i) => (
      !inCircle
        ? Module(moduleName, abbreviation, icon, content)
        : (
          <Popup
            position="bottom center"
            trigger={Module(moduleName, abbreviation, icon, content)}
            on="hover"
            key={moduleName}
          >
            {Content[i]}
          </Popup>
        )
    ))
  )

  return (
    <div className={cx({
      [styles.container]: !withoutStyles,
      [styles.highlight]: highlight,
      [styles.containerCircle]: inCircle,
    })}
    >
      {inCircle ? Modules() : (
        <Popup
          position="bottom center"
          on="hover"
          trigger={<div>{[tooltipTitle, (content ?? Modules())]}</div>}
          data-testid="modules-tooltip"
        >
          {Content}
        </Popup>
      )}
    </div>
  )
})

export { DatabaseModules }
