import * as useSelectedKey from 'uiSrc/store/hooks/use-selected-key-store/useSelectedKeyStore'
import { selectKeyAction } from 'uiSrc/actions'
import { constants } from 'testSrc/helpers'


vi.spyOn(useSelectedKey, 'fetchKeyInfo')


beforeEach(() => {
  vi.stubGlobal('ri', { })

  useSelectedKey.useSelectedKeyStore.setState((state) => ({
    ...state,
    data: constants.KEY_INFO,
  }))
})

describe('selectKeyAction', () => {
  it('should call fetchKeyInfo', () => {
    selectKeyAction(constants.VSCODE_SELECT_KEY_ACTION)
    expect(useSelectedKey.fetchKeyInfo).toBeCalled()
  })
})
