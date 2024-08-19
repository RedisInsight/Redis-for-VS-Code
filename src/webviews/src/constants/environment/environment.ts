import { toNumber } from 'lodash'

// server
export const BASE_APP_URL = import.meta.env.RI_BASE_APP_URL || 'http://localhost'
export const APP_PORT = toNumber(window.ri?.appPort) || import.meta.env.RI_APP_PORT || 5541
export const APP_PREFIX = import.meta.env.RI_APP_PREFIX || 'api'

// browser
export const SCAN_TREE_COUNT_DEFAULT = import.meta.env.RI_SCAN_TREE_COUNT || 10_000
export const SCAN_COUNT_DEFAULT = import.meta.env.RI_SCAN_COUNT_DEFAULT || 500
