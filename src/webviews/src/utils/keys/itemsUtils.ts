import { WithId } from 'uiSrc/interfaces'

export const addNewItem = <T extends WithId>(items: T[], newItem: any):T[] => {
  const lastField = items[items.length - 1]
  return [
    ...items,
    {
      ...newItem,
      id: lastField.id + 1,
    },
  ]
}

export const setEmptyItemById = <T extends WithId>(items: T[], id: number, emptyItem: any) =>
  items.map((item) => (item.id === id
    ? emptyItem
    : item))

export const handleItemChange = <T extends WithId>(items: T[], formItem: string, id: number, value: any) =>
  items.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        [formItem]: value,
      }
    }
    return item
  })

export const removeItem = <T extends WithId>(items: T[], id: number) =>
  items.filter((item) => item.id !== id)
