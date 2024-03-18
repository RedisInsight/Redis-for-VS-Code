import * as modules from 'uiSrc/modules'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import {
  useAppInfoStore,
  initialAppInfoState as initialStateInit,
  fetchAppInfo,
  updateUserConfigSettingsAction,
} from './useAppInfoStore'

vi.spyOn(modules, 'fetchString')

beforeEach(() => {
  useAppInfoStore.setState(initialStateInit)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useAppInfoStore', () => {
  it('processAppInfo', () => {
    // Arrange
    const { processAppInfo } = useAppInfoStore.getState()
    // Act
    processAppInfo()
    // Assert
    expect(useAppInfoStore.getState().loading).toEqual(true)
  })

  it('processAppInfoFinal', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useAppInfoStore.setState((state) => ({ ...state, ...initialState }))

    const { processAppInfoFinal } = useAppInfoStore.getState()
    // Act
    processAppInfoFinal()
    // Assert
    expect(useAppInfoStore.getState().loading).toEqual(false)
  })
  it('processAppInfoSuccess', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useAppInfoStore.setState((state) => ({ ...state, ...initialState }))

    const { processAppInfoSuccess } = useAppInfoStore.getState()
    // Act
    processAppInfoSuccess([constants.SERVER_INFO, constants.SETTINGS, constants.SETTINGS_AGREEMENTS_SPEC])
    // Assert
    expect(useAppInfoStore.getState().server).toEqual(constants.SERVER_INFO)
    expect(useAppInfoStore.getState().config).toEqual(constants.SETTINGS)
    expect(useAppInfoStore.getState().spec).toEqual(constants.SETTINGS_AGREEMENTS_SPEC)
  })
})

describe('thunks', () => {
  it('fetchAppInfo', async () => {
    fetchAppInfo()
    await waitForStack()

    expect(useAppInfoStore.getState().server).toEqual(constants.SERVER_INFO)
    expect(useAppInfoStore.getState().config).toEqual(constants.SETTINGS)
    expect(useAppInfoStore.getState().spec).toEqual(constants.SETTINGS_AGREEMENTS_SPEC)
    expect(useAppInfoStore.getState().loading).toEqual(false)
  })

  describe('updateUserConfigSettingsAction', () => {
    it('succeed to update user config', async () => {
      const initialState = { ...initialStateInit, isShowConceptsPopup: true } // Custom initial state
      useAppInfoStore.setState((state) => ({ ...state, ...initialState }))
      // Arrange
      const data = {
        agreements: {
          eula: true,
          analytics: false,
        },
      }

      // Act
      updateUserConfigSettingsAction(data)

      // Assert
      expect(useAppInfoStore.getState().config).toEqual(data)
      expect(useAppInfoStore.getState().isShowConceptsPopup).toEqual(false)
    })
  })
})
