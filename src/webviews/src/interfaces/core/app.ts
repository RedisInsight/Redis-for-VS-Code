import { AxiosError } from 'axios'

export interface CustomError {
  error: string
  message: string
  statusCode: number
  errorCode?: number
  resourceId?: string
}

export enum RedisResponseEncoding {
  UTF8 = 'utf8',
  ASCII = 'ascii',
  Buffer = 'buffer',
}

export enum RedisResponseBufferType {
  Buffer = 'Buffer',
}

export type RedisResponseBuffer = {
  type: RedisResponseBufferType | string
  data: UintArray
}
// } & Exclude<RedisStringAPI, string>

export type RedisString = string | RedisResponseBuffer

export type UintArray = number[] | Uint8Array

export interface ErrorOptions {
  message: string | JSX.Element
  code?: string
  config?: object
  request?: object
  response?: object
}

export interface EnhancedAxiosError extends AxiosError<CustomError> {
}
