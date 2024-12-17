import { http, HttpResponse } from 'msw'
import * as modules from 'uiSrc/modules'
import { ApiEndpoints } from 'uiSrc/constants'
import { constants } from 'testSrc/helpers'
import { getMWSUrl, waitForStack } from 'testSrc/helpers/testUtils'
import { mswServer } from 'testSrc/server'
import {
  useCertificatesStore,
  initialCertsState as initialStateInit,
  fetchCerts,
  removeCertAction,
} from './useCertificatesStore'

vi.spyOn(modules, 'fetchString')

beforeEach(() => {
  useCertificatesStore.setState(initialStateInit)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useCertificatesStore', () => {
  it('processCerts', () => {
    // Arrange
    const { processCerts } = useCertificatesStore.getState()
    // Act
    processCerts()
    // Assert
    expect(useCertificatesStore.getState().loading).toEqual(true)
  })

  it('processCertsFinal', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useCertificatesStore.setState((state) => ({ ...state, ...initialState }))

    const { processCertsFinal } = useCertificatesStore.getState()
    // Act
    processCertsFinal()
    // Assert
    expect(useCertificatesStore.getState().loading).toEqual(false)
  })
  it('processCertsSuccess', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useCertificatesStore.setState((state) => ({ ...state, ...initialState }))

    const { processCertsSuccess } = useCertificatesStore.getState()
    // Act
    processCertsSuccess(constants.CA_CERTS, constants.CLIENT_CERTS)
    // Assert
    expect(useCertificatesStore.getState().caCerts).toEqual(constants.CA_CERTS)
    expect(useCertificatesStore.getState().clientCerts).toEqual(constants.CLIENT_CERTS)
  })
})

describe('async', () => {
  it('fetchCerts', async () => {
    fetchCerts()
    await waitForStack()

    expect(useCertificatesStore.getState().caCerts).toEqual(constants.CA_CERTS)
    expect(useCertificatesStore.getState().clientCerts).toEqual(constants.CLIENT_CERTS)
    expect(useCertificatesStore.getState().loading).toEqual(false)
  })

  it('removeCertAction', async () => {
    // mock response from BE without first ca cert
    mswServer.use(
      http.get(
        getMWSUrl(`${ApiEndpoints.CA_CERTIFICATES}`),
        () => HttpResponse.json([constants.CA_CERTS[1]]),
      ),
    )

    removeCertAction(constants.CA_CERTS?.[0].id, ApiEndpoints.CA_CERTIFICATES)
    await waitForStack()

    expect(useCertificatesStore.getState().caCerts).toEqual([constants.CA_CERTS[1]])
    expect(useCertificatesStore.getState().clientCerts).toEqual(constants.CLIENT_CERTS)
    expect(useCertificatesStore.getState().loading).toEqual(false)
  })
})
