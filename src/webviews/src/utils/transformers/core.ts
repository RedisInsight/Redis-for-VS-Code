import { MultiSelectOption } from 'uiSrc/components'

export const multiSelectToArray = (items: readonly MultiSelectOption[]) => [...items]
  .map(({ label }) => label)
  .filter((item) => item)

export const arrayToMultiSelect = (items: string[]) => [...items].map((item) => ({
  label: item,
  value: item,
}))
