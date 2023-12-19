import { RelativeWidthSizes } from 'uiSrc/components/virtual-table/interfaces'
import { SortOrder } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/interfaces'

export interface StateAppContext {
  contextDatabaseId: string
  lastPage: string
  dbConfig: {
    treeViewDelimiter: string
    treeViewSort: SortOrder
  }
  keys: {
    tree: {
      delimiter: string
      openNodes: OpenNodes
      selectedLeaf: Nullable<string>
    }
  }
  browser: {
    keyDetailsSizes: {
      [key: string]: Nullable<RelativeWidthSizes>
    }
  }
}

export interface OpenNodes {
  [key: string]: boolean
}
