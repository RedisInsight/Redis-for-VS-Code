import React, { ReactNode, useEffect } from 'react'
import { NodePublicState } from 'react-vtree/dist/es/Tree'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'
import { VscFolder, VscFolderOpened, VscChevronDown, VscChevronRight } from 'react-icons/vsc'

import { formatLongName } from 'uiSrc/utils'
import { RedisString } from 'uiSrc/interfaces'
import { KeyRowName } from '../key-row-name'
import { KeyRowDelete } from '../key-row-delete'
import { KeyRowType } from '../key-row-type'
import { TreeData } from '../virtual-tree/interfaces'
import styles from './styles.module.scss'

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
    nestingLevel,
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
    onDelete,
    onDeleteClicked,
    getMetadata,
    updateStatusOpen,
    updateStatusSelected,
  } = data

  const keyString = formatLongName(nameString)

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
      updateStatusSelected?.(nameBuffer, keyString, type)
    }
  }, [isSelected])

  const handleClick = () => {
    if (isLeaf) {
      updateStatusSelected?.(nameBuffer, keyString, type)
    }

    updateStatusOpen?.(fullName, !isOpen)
    !isLeaf && setOpen(!isOpen)
  }

  const handleKeyDown = ({ key }: React.KeyboardEvent<HTMLDivElement>) => {
    if (key === ' ') { // TODO: keys enum
      handleClick()
    }
  }

  const handleDelete = (nameBuffer: RedisString) => {
    onDelete?.(nameBuffer)
  }

  const handleDeletePopoverOpen = () => {
    onDeleteClicked?.(type)
  }

  const folderTooltipContent = `${keyString}\n`
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
      <KeyRowDelete
        nameBuffer={nameBuffer}
        nameString={nameString}
        handleDelete={handleDelete}
        handleDeletePopoverOpen={handleDeletePopoverOpen}
      />
    </div>
  )

  const NestingLevels = (): ReactNode => {
    if (!nestingLevel) {
      return <div className={styles.nestingLevel} />
    }
    const levels = Array.from({ length: nestingLevel })
    return (
      <>
        <div className={styles.nestingLevel} />
        {levels.map(() => (
          <div
            key={Math.random()}
            className={styles.nestingLevel}
          />
        ))}
      </>
    )
  }

  const Node = (
    <div
      className={cx(styles.nodeContent, 'group')}
      role="treeitem"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onFocus={() => { }}
      data-testid={`node-item_${fullName}${isOpen && !isLeaf ? '--expanded' : ''}`}
    >
      {!isLeaf && <Folder />}
      {isLeaf && <Leaf />}
    </div>
  )

  return (
    <div
      style={{ ...style }}
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
