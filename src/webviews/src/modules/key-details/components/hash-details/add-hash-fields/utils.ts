import { IHashFieldState, INITIAL_HASH_FIELD_STATE } from 'uiSrc/modules'

export const addNewField = (fields: IHashFieldState[]) => {
  const lastField = fields[fields.length - 1]
  return [
    ...fields,
    {
      ...INITIAL_HASH_FIELD_STATE,
      id: lastField.id + 1,
    },
  ]
}

export const clearFieldValueById = (fields: IHashFieldState[], id: number) =>
  fields.map((item) => (item.id === id
    ? {
      ...item,
      fieldName: '',
      fieldValue: '',
    }
    : item))

export const handleFieldChange = (fields: IHashFieldState[], formField: string, id: number, value: any) =>
  fields.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        [formField]: value,
      }
    }
    return item
  })

export const removeField = (fields: IHashFieldState[], id: number) =>
  fields.filter((item) => item.id !== id)
