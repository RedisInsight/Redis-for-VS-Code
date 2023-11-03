// import the webdriver and the high level browser wrapper
import {
    By,
    until, VSBrowser,
    WebDriver
} from 'vscode-extension-tester';
export class WebDriverExtensions {
    /**
     * wait for element
     * @param xpath xpath of element
     */
    static async waitForElementPresent( elementXpath: string, timeout: number = 5000)
    {
        let driver =  VSBrowser.instance.driver;
        await driver.wait(function () {
            return driver.wait(until.elementIsVisible(driver.findElement(By.xpath(elementXpath))),timeout);
        });
    }
}
