import { By } from 'vscode-extension-tester';
import { BaseComponent } from './BaseComponent';

export class Toast extends BaseComponent {
    toastHeader = By.xpath(`//*[@data-test-subj='euiToastHeader']`)
    toastCloseButton = By.xpath('[data-test-subj=toastCloseButton]');
}
