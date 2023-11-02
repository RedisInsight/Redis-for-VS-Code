import React, { ReactNode, useEffect } from 'react'
import { NodePublicState } from 'react-vtree/dist/es/Tree'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'
import { VscFolder, VscFolderOpened, VscChevronDown, VscChevronRight } from 'react-icons/vsc'

import { formatLongName } from 'uiSrc/utils'
import { KeyRowName } from '../key-row-name'
import { KeyRowType } from '../key-row-type'
import { TreeData } from '../virtual-tree/interfaces'
import styles from './styles.module.scss'

const MAX_NESTING_LEVEL = 20
const PADDING_LEVEL = 22
const PADDING_LEFT = 12

// Node component receives all the data we created in the `treeWalker` +
// internal openness state (`isOpen`), function to change internal openness
// `style` parameter that should be added to the root div.
export const Node = ({
  data,
  isOpen,
  style,
  setOpen,
}: NodePublicState<TreeData>) => {
  const {
    isLeaf,
    keyCount,
    nestingLevel: currentNestingLevel,
    fullName,
    nameBuffer,
    path,
    shortName,
    type,
    ttl,
    size,
    nameString,
    keyApproximate,
    isSelected,
    getMetadata,
    updateStatusOpen,
    updateStatusSelected,
  } = data

  const nestingLevel = currentNestingLevel > MAX_NESTING_LEVEL ? MAX_NESTING_LEVEL : currentNestingLevel

  useEffect(() => {
    if (!isLeaf || !nameBuffer) {
      return
    }
    if (!size || !ttl) {
      getMetadata?.(nameBuffer, path)
    }
  }, [])

  useEffect(() => {
    if (isSelected && nameBuffer) {
      updateStatusSelected?.(nameBuffer)
    }
  }, [isSelected])

  const handleClick = () => {
    if (isLeaf && !isSelected) {
      updateStatusSelected?.(nameBuffer)
    }

    updateStatusOpen?.(fullName, !isOpen)
    !isLeaf && setOpen(!isOpen)
  }

  const handleKeyDown = ({ key }: React.KeyboardEvent<HTMLDivElement>) => {
    if (key === ' ') { // TODO: keys enum
      handleClick()
    }
  }

  const folderTooltipContent = `${formatLongName(nameString)}\n`
    + `${keyCount} ${l10n.t('key(s)')} (${Math.round(keyApproximate * 100) / 100}%)`

  const Folder = () => (
    <div className={styles.nodeName}>
      {!isOpen && (
        <>
          <VscChevronRight
            className={cx(styles.nodeIcon, styles.nodeIconArrow)}
            data-testid={`node-arrow-icon_${fullName}`}
          />
          <VscFolder className={cx(styles.nodeIcon)} data-testid={`node-folder-icon_${fullName}`} />
        </>
      )}
      {isOpen && (
        <>
          <VscChevronDown className={cx(styles.nodeIcon, styles.nodeIconArrow)} />
          <VscFolderOpened className={cx(styles.nodeIcon)} />
        </>
      )}
      <span className="truncate text-vscode-foreground text" data-testid={`folder-${nameString}`}>
        {nameString}
      </span>
    </div>
  )

  const Leaf = () => (
    <div className="flex truncate h-full">
      <KeyRowName shortString={shortName} nameString={nameString} />
      <KeyRowType type={type} nameString={nameString} />
    </div>
  )

  const NestingLevels = (): ReactNode => {
    if (!nestingLevel) {
      return null
    }
    const levels = Array.from({ length: nestingLevel })
    return levels.map((_, i) => {
      const left = ((nestingLevel - i) || 1) * PADDING_LEVEL - 2
      return (
        <div
          key={left}
          className={cx(styles.nestingLevel)}
          style={{ left }}
        />
      )
    })
  }

  const Node = (
    <div
      className={cx(styles.nodeContent)}
      role="treeitem"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onFocus={() => {}}
      data-testid={`node-item_${fullName}`}
    >
      {!isLeaf && <Folder />}
      {isLeaf && <Leaf />}
    </div>
  )

  return (
    <div
      style={{
        ...style,
        paddingLeft: (nestingLevel * PADDING_LEVEL) + PADDING_LEFT,
      }}
      className={cx(
        styles.nodeContainer, {
          [styles.nodeSelected]: isSelected && isLeaf,
        },
      )}
    >
      <NestingLevels />
      {isLeaf && Node}
      {!isLeaf && (
        <span title={folderTooltipContent}>
          {Node}
        </span>
      )}
    </div>
  )
}
