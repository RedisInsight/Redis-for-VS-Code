import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { ActivityBar, SideBarView, VSBrowser } from 'vscode-extension-tester';
import { BottomBar } from '../../../page-objects/components/bottom-bar/BottomBar';
import { WebView } from '../../../page-objects/components/WebView';
import { CliViewPanel } from '../../../page-objects/components/bottom-bar/CliViewPanel';
import { InputActions } from '../../../helpers/common-actions/actions/InputActions';
import { Common } from '../../../helpers/Common';
import { KeyDetailsView } from '../../../page-objects/components/edit-panel/KeyDetailsView';
import { CommonDriverExtension } from '../../../helpers/CommonDriverExtension';
import { ButtonsActions } from '../../../helpers/common-actions/actions/ButtonAction';

describe('Set TTL for Key', () => {
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
  it('Verify that user can specify TTL for Key', async function () {
    const ttlValue = '2147476121';

    cliViewPanel = await bottomBar.openCliViewPanel();
    await webView.switchToFrame(CliViewPanel.cliFrame);
    const keyName = Common.generateWord(20);
    const command = `SET ${keyName} a`;
    await cliViewPanel.executeCommand(`${command}`);
    await webView.switchBack();

    sideBarView = await (await new ActivityBar().getViewControl('RedisInsight'))?.openView();

    //TODO click on string
    await CommonDriverExtension.driverSleep();

    await webView.switchToFrame(KeyDetailsView.keyFrame);
    const inputField = await keyDetailsView.getElement(keyDetailsView.ttlField);
    await InputActions.slowType(inputField, ttlValue);
    await ButtonsActions.clickElement(keyDetailsView.saveTtl);

    // TODO wait and Refresh the page in several seconds
    await CommonDriverExtension.driverSleep();

    const newTtlValue  = Number(await keyDetailsView.getKeyTtl());
    expect(Number(ttlValue)).gt(newTtlValue);
  });
});
