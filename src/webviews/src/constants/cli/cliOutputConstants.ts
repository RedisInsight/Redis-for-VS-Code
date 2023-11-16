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
export enum CliKeys {
  ENTER = 'Enter',
  SPACE = ' ',
  ESCAPE = 'Escape',
  TAB = 'Tab',
  BACKSPACE = 'Backspace',
  F2 = 'F2',
  ALT = 'Alt',
  SHIFT = 'Shift',
  CTRL = 'Control',
  META = 'Meta',
  ARROW_DOWN = 'ArrowDown',
  ARROW_UP = 'ArrowUp',
  ARROW_LEFT = 'ArrowLeft',
  ARROW_RIGHT = 'ArrowRight',
  PAGE_UP = 'PageUp',
  PAGE_DOWN = 'PageDown',
  END = 'End',
  HOME = 'Home',
}
