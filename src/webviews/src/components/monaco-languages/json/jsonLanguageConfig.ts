import * as monaco from 'monaco-editor'

export const jsonLanguageConfig: monaco.languages.LanguageConfiguration = {
  // eslint-disable-next-line no-useless-escape
  wordPattern: /(-?\d*\.\d\w*)|([^\[\{\]\}\:\"\,\s]+)/g,

  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },

  brackets: [
    ['{', '}'],
    ['[', ']'],
  ],

  autoClosingPairs: [
    { open: '{', close: '}', notIn: ['string'] },
    { open: '[', close: ']', notIn: ['string'] },
    { open: '"', close: '"', notIn: ['string'] },
  ],
}
