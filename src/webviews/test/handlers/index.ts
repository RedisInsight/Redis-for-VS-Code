import browser from './browser'
import database from './database'

// @ts-ignore
export const handlers: any[] = [].concat(
  browser,
  database,
)
