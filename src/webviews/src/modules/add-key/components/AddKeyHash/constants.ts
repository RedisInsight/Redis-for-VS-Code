export interface IHashFieldState {
  fieldName: string
  fieldValue: string
  id: number
  fieldTTL?: number
}

export const INITIAL_HASH_FIELD_STATE: IHashFieldState = {
  fieldName: '',
  fieldValue: '',
  fieldTTL: undefined,
  id: 0,
}
