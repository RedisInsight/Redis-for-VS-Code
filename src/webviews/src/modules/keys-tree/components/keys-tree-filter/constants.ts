import * as l10n from '@vscode/l10n'
import {
  KeyTypes,
  ModulesKeyTypes,
} from 'uiSrc/constants'
import { SelectOption } from 'uiSrc/ui'

export const ALL_KEY_TYPES_VALUE = 'all'

export const FILTER_KEY_TYPE_OPTIONS: SelectOption[] = [
  {
    label: l10n.t('All Key Types'),
    value: ALL_KEY_TYPES_VALUE,
  },
  {
    label: l10n.t('Hash'),
    value: KeyTypes.Hash,
    // color: GROUP_TYPES_COLORS[KeyTypes.Hash],
  },
  {
    label: l10n.t('List'),
    value: KeyTypes.List,
    // color: GROUP_TYPES_COLORS[KeyTypes.List],
  },
  {
    label: l10n.t('Set'),
    value: KeyTypes.Set,
    // color: GROUP_TYPES_COLORS[KeyTypes.Set],
  },
  {
    label: l10n.t('Sorted Set'),
    value: KeyTypes.ZSet,
    // color: GROUP_TYPES_COLORS[KeyTypes.ZSet],
  },
  {
    label: l10n.t('String'),
    value: KeyTypes.String,
    // color: GROUP_TYPES_COLORS[KeyTypes.String],
  },
  {
    label: l10n.t('JSON'),
    value: KeyTypes.ReJSON,
    // color: GROUP_TYPES_COLORS[KeyTypes.ReJSON],
  },
  {
    label: l10n.t('Stream'),
    value: KeyTypes.Stream,
    // color: GROUP_TYPES_COLORS[KeyTypes.Stream],
  },
  {
    label: l10n.t('Graph'),
    value: ModulesKeyTypes.Graph,
    // color: GROUP_TYPES_COLORS[ModulesKeyTypes.Graph],
  },
  {
    label: l10n.t('TS'),
    value: ModulesKeyTypes.TimeSeries,
    // color: GROUP_TYPES_COLORS[ModulesKeyTypes.TimeSeries],
  },
]
