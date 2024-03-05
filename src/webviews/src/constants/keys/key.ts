import * as l10n from '@vscode/l10n'
import { KeyValueFormat } from './formatters'

export const TEXT_UNPRINTABLE_CHARACTERS = {
  title: l10n.t('Non-printable characters have been detected'),
  text: l10n.t('Use CLI to edit without data loss.'),
}
export const TEXT_DISABLED_FORMATTER_EDITING = l10n.t('Cannot edit the value in this format')
export const TEXT_DISABLED_STRING_EDITING = l10n.t('Load the entire value to edit it')
export const TEXT_DISABLED_STRING_FORMATTING = l10n.t('Load the entire value to select a format')

export const TEXT_INVALID_VALUE = {
  title: l10n.t('Value will be saved as Unicode'),
  text: l10n.t('as it is not valid in the selected format.'),
}

export const TEXT_DISABLED_COMPRESSED_VALUE: string = l10n.t('Cannot edit the decompressed value')

export const TEXT_FAILED_CONVENT_FORMATTER = (format: KeyValueFormat) => l10n.t('Failed to convert to {0}', format)

export const STRING_MAX_LENGTH = 4999
