import { By } from 'vscode-extension-tester'
import { BaseComponent } from '../BaseComponent'

export class InputWithButtons extends BaseComponent {
    static applyInput = By.xpath(`//*[@data-testid='apply-btn']`)
    static cancelInput = By.xpath(`//*[@data-testid='cancel-btn']`)
}
