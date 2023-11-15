import { HttpResponse, http, passthrough } from 'msw'

import { BASE_URL } from '../src/webviews/src/constants'

const getMWSUrl = (url) =>
  `${BASE_URL}${url.startsWith('/') ? url.slice(1) : url}`

const getMockMetadata = ({ keys }) =>
  keys.map((name) => ({ type: 'string', name }))

export const mswHandlers = [
  http.post(
    getMWSUrl('databases/:instanceId/keys/get-metadata'),
    async ({ request }) =>
      HttpResponse.json(getMockMetadata(await request.json())),
  ),
  http.get(/\.(ts|tsx|js|jsx|css|scss)$/, () => passthrough()),
]
