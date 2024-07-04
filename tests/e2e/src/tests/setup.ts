import { Eula } from '../helpers/api/Eula';

describe.only('Setup tests', () => {
  it('Setup Eula accepted', async () => {
    await Eula.accept()
  });
})
