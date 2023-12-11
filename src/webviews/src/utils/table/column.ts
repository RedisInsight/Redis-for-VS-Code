import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'

export const getColumnWidth = (i: number, width: number, columns: ITableColumn[], minColumnWidth: number = 190) => {
  const maxTableWidth = columns.reduce((a, { maxWidth = minColumnWidth }) => a + maxWidth, 0)

  if (maxTableWidth < width) {
    const growingColumnsWidth = columns
      .filter(({ maxWidth = 0 }) => maxWidth)
      .map(({ maxWidth }) => maxWidth)

    const growingColumnsCount = columns.length - growingColumnsWidth.length
    const maxWidthTable = growingColumnsWidth?.reduce((a = 0, b = 0) => a + b, 0) ?? 0
    const newColumns = columns.map((column) => {
      const { minWidth, maxWidth = 0 } = column
      const newMinWidth = ((width - maxWidthTable) / growingColumnsCount)

      return {
        ...column,
        width: maxWidth
          ? minWidth
          : newMinWidth,
      }
    })

    return newColumns[i]?.width
  }
  return columns[i]?.minWidth
}
