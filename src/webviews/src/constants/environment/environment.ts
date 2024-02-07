const port = Number(localStorage.getItem('apiPort'))

// server
export const BASE_API_URL = import.meta.env.RI_BASE_API_URL || 'http://localhost'
export const API_PORT = port || import.meta.env.RI_API_PORT || 5541
export const API_PREFIX = import.meta.env.RI_API_PREFIX || 'api'

// browser
export const SCAN_TREE_COUNT_DEFAULT = import.meta.env.RI_SCAN_TREE_COUNT || 10_000
export const SCAN_COUNT_DEFAULT = import.meta.env.RI_SCAN_COUNT_DEFAULT || 500
