import { KeyDto, KeyResponse, RedisString } from 'uiSrc/interfaces'

export interface HashState {
  loading: boolean
  data: HashDataState
  updateValue: {
    loading: boolean
  }
}

export interface HashActions {
  resetHashStore: () => void
  processHash: () => void
  processHashFinal: () => void
  processHashSuccess: (data: GetHashFieldsResponse, match: string) => void
  processHashMoreSuccess: (data: GetHashFieldsResponse, match: string) => void
  removeFields: (data: RedisString[]) => void
  updateFields: (data: AddFieldsToHashDto) => void
  resetUpdateValue: () => void
}

export interface HashField {
  field: RedisString
  value: RedisString
}

export interface HashScanResponse extends KeyResponse {
  nextCursor: number
  fields: HashField[]
}

export interface GetHashFieldsResponse extends HashScanResponse {
  total: number
}

export interface ModifiedGetHashMembersResponse extends GetHashFieldsResponse {
  key?: RedisString
  match: string
}

export interface HashDataState extends ModifiedGetHashMembersResponse {
  fields: HashField[]
}

export interface AddFieldsToHashDto extends KeyDto {
  fields: HashField[]
}
