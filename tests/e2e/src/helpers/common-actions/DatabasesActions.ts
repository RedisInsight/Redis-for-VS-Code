import { expect } from 'chai'
import {
  ActivityBar,
  By,
  Locator,
  VSBrowser,
  Workbench,
  until,
} from 'vscode-extension-tester'
import { CommonDriverExtension } from '../CommonDriverExtension'
import {
  DatabaseDetailsView,
  EditDatabaseView,
  TreeView,
} from '@e2eSrc/page-objects/components'
import {
  ViewElements,
  Views,
  WebView,
} from '@e2eSrc/page-objects/components/WebView'
import { AddNewDatabaseParameters } from '../types/types'
import { DatabaseAPIRequests } from '../api'

/**
 * Database details actions
 */
export class DatabasesActions extends CommonDriverExtension {
  /**
   * Check module icons on the page
   * @param moduleList Array with modules list
   */
  static async checkModulesOnPage(moduleList: Locator[]): Promise<void> {
    for (const item of moduleList) {
      expect(await this.driver.wait(until.elementLocated(item), 5000)).eql(
        true,
        `${item} icon not found`,
      )
    }
  }
  /**
   * Verify that success notification displayed when adding database
   */
  static async verifyDatabaseAdded(): Promise<void> {
    await CommonDriverExtension.driverSleep(1000)
    let notifications = await new Workbench().getNotifications()
    let notification = notifications[0]
    // Check the notification message
    let message = await notification.getMessage()
    expect(message).eqls(
      `Database has been added`,
      'The notification is not displayed',
    )
    // Verify that panel is closed
    expect(
      await new DatabaseDetailsView().isElementDisplayed(
        By.xpath(ViewElements[Views.DatabaseDetailsView]),
      ),
    ).false
  }

  /**
   * Verify that success notification displayed when editing database
   */
  static async verifyDatabaseEdited(): Promise<void> {
    await CommonDriverExtension.driverSleep(1000)
    let notifications = await new Workbench().getNotifications()
    let notification = notifications[0]
    // Check the notification message
    let message = await notification.getMessage()
    expect(message).eqls(
      `Database has been edited`,
      'The notification is not displayed',
    )
    // Verify that panel is closed
    expect(
      await new EditDatabaseView().isElementDisplayed(
        By.xpath(ViewElements[Views.DatabaseDetailsView]),
      ),
    ).false
  }

  /**
   * Accept License terms and add database using api
   * @param databaseParameters The database parameters
   */
  static async acceptLicenseTermsAndAddDatabaseApi(
    databaseParameters: AddNewDatabaseParameters,
  ): Promise<void> {
    await DatabaseAPIRequests.addNewStandaloneDatabaseApi(databaseParameters)
    await VSBrowser.instance.waitForWorkbench(20_000)
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await new WebView().switchToFrame(Views.TreeView)
    await new TreeView().clickDatabaseByName(databaseParameters.databaseName!)
  }
}
