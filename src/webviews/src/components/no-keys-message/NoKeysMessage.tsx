import * as l10n from '@vscode/l10n'
import { FC } from 'react'
import { Nullable } from 'uiSrc/interfaces'

export interface Props {
  total: Nullable<number>
  // scanned: number
}

export const NoKeysMessage: FC<Props> = (props) => {
  const {
    total,
    // scanned,
  } = props

  // TODO: will be implemented in the future
  // const { selectedIndex, isSearched: redisearchIsSearched } = useSelector(redisearchSelector)
  // const { isSearched: patternIsSearched, isFiltered, searchMode } = useSelector(keysSelector)

  // if (searchMode === SearchMode.Redisearch) {
  //   if (!selectedIndex) {
  //     return NoSelectedIndexText
  //   }

  //   if (total === 0) {
  //     return NoResultsFoundText
  //   }

  //   if (redisearchIsSearched) {
  //     return scanned < total ? NoResultsFoundText : FullScanNoResultsFoundText
  //   }
  // }

  if (total === 0) {
    return l10n.t('Keys are the foundation of Redis.')
  }

  // if (patternIsSearched) {
  //   return scanned < total ? ScanNoResultsFoundText : FullScanNoResultsFoundText
  // }

  // if (isFiltered && scanned < total) {
  //   return ScanNoResultsFoundText
  // }

  return l10n.t('No results found.')
}
