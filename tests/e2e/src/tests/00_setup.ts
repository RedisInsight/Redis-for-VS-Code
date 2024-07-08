import { ServerActions } from '@e2eSrc/helpers/common-actions/ServerActions';
import { Eula } from '../helpers/api/Eula';
import { describe, it } from 'mocha'

describe('Setup tests', () => {
  it('Setup Eula accepted', async () => {
    await ServerActions.waitForServerInitialized()
    await Eula.accept()
  });
})
