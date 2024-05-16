import * as modules from 'uiSrc/modules'
import { localStorageService } from 'uiSrc/services'
import { StorageItem } from 'uiSrc/constants'
import { constants } from 'testSrc/helpers'
import { waitForStack } from 'testSrc/helpers/testUtils'
import {
  useAppInfoStore,
  initialAppInfoState as initialStateInit,
  fetchAppInfo,
  updateUserConfigSettingsAction,
} from './useAppInfoStore'

const newDelimiter = '*1*'

vi.spyOn(localStorageService, 'set')
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
    processAppInfoSuccess({
      server: constants.SERVER_INFO,
      config: constants.SETTINGS,
      spec: constants.SETTINGS_AGREEMENTS_SPEC,
      commandsArray: constants.REDIS_COMMANDS_ARRAY,
      commandGroups: constants.REDIS_COMMANDS_GROUPS,
    })
    // Assert
    expect(useAppInfoStore.getState().server).toEqual(constants.SERVER_INFO)
    expect(useAppInfoStore.getState().config).toEqual(constants.SETTINGS)
    expect(useAppInfoStore.getState().spec).toEqual(constants.SETTINGS_AGREEMENTS_SPEC)
    expect(useAppInfoStore.getState().commandsArray).toEqual(constants.REDIS_COMMANDS_ARRAY)
    expect(useAppInfoStore.getState().commandGroups).toEqual(constants.REDIS_COMMANDS_GROUPS)
  })

  it('setIsShowConceptsPopup', () => {
    // Arrange
    const initialState = { ...initialStateInit, isShowConceptsPopup: false } // Custom initial state
    useAppInfoStore.setState((state) => ({ ...state, ...initialState }))

    const { setIsShowConceptsPopup } = useAppInfoStore.getState()
    // Act
    setIsShowConceptsPopup(true)
    // Assert
    expect(useAppInfoStore.getState().isShowConceptsPopup).toEqual(true)
  })

  it('setDelimiter', () => {
    // Arrange
    const { setDelimiter } = useAppInfoStore.getState()
    // Act
    setDelimiter(newDelimiter)
    // Assert
    expect(localStorageService.set).toBeCalledWith(StorageItem.treeViewDelimiter, newDelimiter)
    expect(useAppInfoStore.getState().delimiter).toEqual(newDelimiter)
  })
})

describe('thunks', () => {
  it('fetchAppInfo', async () => {
    fetchAppInfo()
    await waitForStack()

    expect(useAppInfoStore.getState().server).toEqual(constants.SERVER_INFO)
    expect(useAppInfoStore.getState().config).toEqual(constants.SETTINGS)
    expect(useAppInfoStore.getState().spec).toEqual(constants.SETTINGS_AGREEMENTS_SPEC)
    expect(useAppInfoStore.getState().commandsArray).toEqual(constants.REDIS_COMMANDS_ARRAY)
    expect(useAppInfoStore.getState().commandGroups).toEqual(constants.REDIS_COMMANDS_GROUPS)
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

      await waitForStack()

      // Assert
      expect(useAppInfoStore.getState().config).toEqual(data)
      expect(useAppInfoStore.getState().isShowConceptsPopup).toEqual(false)
    })
  })
})
