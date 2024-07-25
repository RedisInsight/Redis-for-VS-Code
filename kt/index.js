const keytar = require('keytar');

const SERVICE = 'keytar_test_service';
const ACCOUNT = 'keytar_test_account';
const KEY = 'keytar_test_key';
const init = async () => {
  console.log('setting key...')
  await keytar.setPassword(SERVICE, ACCOUNT, KEY);
  console.log('Key was set!')

  console.log('Getting key...')
  const key = await keytar.getPassword(SERVICE, ACCOUNT);
  console.log('Got key', key)
};

init();
