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
}

export interface OpenNodes {
  [key: string]: boolean
}
