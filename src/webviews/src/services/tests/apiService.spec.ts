import { AxiosRequestConfig } from 'axios'
import { requestInterceptor } from 'uiSrc/services/apiService'

const mockDbIndex = 5
vi.stubGlobal('ri', { database: { db: mockDbIndex } })

describe('requestInterceptor', () => {
  it('should properly set db-index to headers', () => {

    const config: AxiosRequestConfig = {
      headers: {},
      url: 'http://localhost:8080/databases/123-215gg-23/endpoint',
    }

    requestInterceptor(config)
    expect(config?.headers?.['ri-db-index']).toEqual(mockDbIndex)
  })

  it('should not set db-index to headers with url not related to database', () => {

    const config: AxiosRequestConfig = {
      headers: {},
      url: 'http://localhost:8080/settings/123-215gg-23/endpoint',
    }

    requestInterceptor(config)
    expect(config?.headers?.['ri-db-index']).toEqual(undefined)
  })
})
