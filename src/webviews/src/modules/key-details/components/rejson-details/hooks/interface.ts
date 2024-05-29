import { Nullable } from 'uiSrc/interfaces'

export interface RejsonState {
  loading: boolean
  error: Nullable<string>
  data: RejsonDataState
}

export interface RejsonActions {
  resetRejsonStore: () => void
  processRejson: () => void
  processRejsonFinal: () => void
  processRejsonSuccess: (data: RejsonDataState) => void
}

export interface RejsonDataState {
  downloaded: boolean
  type?: string
  path?: string
  data?: SafeRejsonRlDataDto[] | string | number | boolean | null | object
}

export interface SafeRejsonRlDataDto {
  key: string
  path: string
  cardinality?: number
  type: RejsonRlDataType
  value?: string | number | boolean | null
}

export enum RejsonRlDataType {
  String = 'string',
  Number = 'number',
  Integer = 'integer',
  Boolean = 'boolean',
  Null = 'null',
  Array = 'array',
  Object = 'object',
}
