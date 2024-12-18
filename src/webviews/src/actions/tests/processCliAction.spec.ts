import * as useCliSettingsThunks from 'uiSrc/modules/cli/hooks/cli-settings/useCliSettingsThunks'
import { constants } from 'testSrc/helpers'
import { processCliAction } from 'uiSrc/actions'

vi.spyOn(useCliSettingsThunks, 'addCli')

beforeEach(() => {
  vi.stubGlobal('ri', { })
})

describe('processCliAction', () => {
  it('should call addCli', () => {
    processCliAction(constants.VSCODE_CLI_ACTION)
    expect(useCliSettingsThunks.addCli).toBeCalled()
  })
})
