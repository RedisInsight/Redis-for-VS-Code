import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { ActivityBar, SideBarView, VSBrowser } from 'vscode-extension-tester';
import { BottomBar } from '../../../page-objects/components/bottom-bar/BottomBar';
import { WebView } from '../../../page-objects/components/WebView';
import { CliViewPanel } from '../../../page-objects/components/bottom-bar/CliViewPanel';
import { Common } from '../../../helpers/Common';
import { KeyDetailsView } from '../../../page-objects/components/edit-panel/KeyDetailsView';
import { CommonDriverExtension } from '../../../helpers/CommonDriverExtension';
import { COMMANDS_TO_CREATE_KEY, keyLength } from '../../../helpers/constants';
import { keyTypes } from '../../../helpers/keys';

const keysData = keyTypes.map(object => ({ ...object })).slice(0, 6);
for (const key of keysData) {
  key.keyName = `${key.keyName}` + '-' + `${Common.generateWord(keyLength)}`;
}
// Arrays with TTL in seconds, min, hours, days, months, years and their values in Browser Page
const ttlForSet = [59, 800, 20000, 2000000, 31000000, 2147483647];
const ttlValues = ['s', '13 min', '5 h', '23 d', '11 mo', '68 yr'];

describe('TTL values in Keys Table', () => {
  let browser: VSBrowser;
  let webView: WebView;
  let bottomBar: BottomBar;
  let cliViewPanel: CliViewPanel;
  let keyDetailsView: KeyDetailsView;
  let sideBarView: SideBarView | undefined;

  beforeEach(async () => {
    browser = VSBrowser.instance;
    bottomBar = new BottomBar();
    webView = new WebView();
    keyDetailsView = new KeyDetailsView();

    await browser.waitForWorkbench(20_000);

  });
  afterEach(async () => {
    await webView.switchBack();
    await bottomBar.openTerminalView();
    cliViewPanel = await bottomBar.openCliViewPanel();
    await webView.switchToFrame(CliViewPanel.cliFrame);
    await cliViewPanel.executeCommand(`FLUSHDB`);
  });

  it('Verify that Key is deleted if TTL finishes', async function () {
    // Create new key with TTL
    const TTL = 15;
    let ttlToCompare = TTL;

    cliViewPanel = await bottomBar.openCliViewPanel();
    await webView.switchToFrame(CliViewPanel.cliFrame);

    await cliViewPanel.executeCommand(`set (keysData[i].keyName)} EXPIRE ${TTL}`);

    await webView.switchBack();
    sideBarView = await (await new ActivityBar().getViewControl('RedisInsight'))?.openView();
    await CommonDriverExtension.driverSleep();
    await webView.switchToFrame(KeyDetailsView.keyFrame);

    //TODO verify that the key is really added

    await CommonDriverExtension.driverSleep(TTL);

    //TODO verify that the key is really deleted
  });

  it('Verify that user can see TTL in the list of keys rounded down to the nearest unit', async function () {

    cliViewPanel = await bottomBar.openCliViewPanel();
    await webView.switchToFrame(CliViewPanel.cliFrame);

    for (let i = 0; i < keysData.length; i++) {
      await cliViewPanel.executeCommand(`${COMMANDS_TO_CREATE_KEY[keysData[i].textType](keysData[i].keyName)} EXPIRE ${ttlForSet[i]}`);
    }
    await webView.switchBack();
    sideBarView = await (await new ActivityBar().getViewControl('RedisInsight'))?.openView();
    await CommonDriverExtension.driverSleep();
    await webView.switchToFrame(KeyDetailsView.keyFrame);
    // Check that Keys has correct TTL value in keys table
    for (let i = 0; i < keysData.length; i++) {
      //TODO open the key here by keysData[i].keyName
      //TODO can be verified after the all key will be displayed
      await CommonDriverExtension.driverSleep();
      await expect(await keyDetailsView.getKeyTtl()).contains(ttlValues[i], `TTL value in keys table is not ${ttlValues[i]}`);
    }
  });
});
