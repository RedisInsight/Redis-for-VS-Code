import * as l10n from '@vscode/l10n'

export const ClearCommand = 'clear'
export const SelectCommand = 'select'

export enum CliOutputFormatterType {
  Text = 'TEXT',
  Raw = 'RAW',
}

export const ConnectionSuccessOutputText = [
  '\n',
  l10n.t('Connected.'),
  '\n',
  l10n.t('Ready to execute commands.'),
  '\n\n',
]
