import { HttpResponse, http, passthrough } from 'msw'

const BASE_API_URL = process.env.BASE_API_URL || 'http://localhost'
const API_PORT = process.env.BASE_API_URL || '5001'
const API_PREFIX = process.env.API_PREFIX || 'api'
const BASE_URL = `${BASE_API_URL}:${API_PORT}/${API_PREFIX}/`

const getMWSUrl = (url) =>
  `${BASE_URL}${url.startsWith('/') ? url.slice(1) : url}`

const getMockMetadata = ({ keys }) => keys.map((name) => ({ type: 'string', name }))

export const handlers = [
  http.post(
    getMWSUrl('databases/:instanceId/keys/get-metadata'),
    async ({ request }) =>
      HttpResponse.json(getMockMetadata(await request.json())),
  ),
  http.get(/\.(ts|tsx|js|jsx|css|scss)$/, () => passthrough()),
]
