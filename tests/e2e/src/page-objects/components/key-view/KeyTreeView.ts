import { By } from 'selenium-webdriver';
import { BaseComponent } from '../BaseComponent';
import { InputActions } from '../../../helpers/common-actions/actions/InputActions';

/**
 * key details view
 */
export class KeyTreeView extends BaseComponent {
  // frame locator
  static treeFrame = By.xpath(`//div[contains(@data-parent-flow-to-element-id, 'webview-editor-element')]/iframe`);

  // key tree view locators
  ttlField = By.xpath(`(//div[@data-keybinding-context and not(@class)]/iframe[@class='webview ready' and not(@data-parent-flow-to-element-id)])[2]`);

  constructor() {
    super(KeyTreeView.treeFrame);
  }

  /**
   * Open key details with search
   * @param keyName The name of the key
   */
  async openKeyDetails(keyName: string): Promise<void> {
   //TODO
  }
}
