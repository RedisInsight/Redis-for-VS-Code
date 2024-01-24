import { Eula } from './helpers/api/Eula';

describe('Setup tests', () => {
  it('Setup Eula accepted', async () => {
    await Eula.accept()
  });
})
