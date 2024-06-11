import { KeyTypes } from 'uiSrc/constants'

export const ADD_KEY_TYPE_OPTIONS = [
  {
    text: 'Hash',
    value: KeyTypes.Hash,
  },
  {
    text: 'List',
    value: KeyTypes.List,
  },
  {
    text: 'Set',
    value: KeyTypes.Set,
  },
  {
    text: 'Sorted Set',
    value: KeyTypes.ZSet,
  },
  {
    text: 'String',
    value: KeyTypes.String,
  },
  // {
  //   text: 'JSON',
  //   value: KeyTypes.ReJSON,
  // },
  // {
  //   text: 'Stream',
  //   value: KeyTypes.Stream,
  // },
]
