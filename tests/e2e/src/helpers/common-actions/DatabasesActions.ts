import { expect } from 'chai'
import {
  ActivityBar,
  Locator,
  VSBrowser,
  until,
} from 'vscode-extension-tester'
import { CommonDriverExtension } from '../CommonDriverExtension'
import {
  TreeView,
} from '@e2eSrc/page-objects/components'
import {
  Views,
  WebView,
} from '@e2eSrc/page-objects/components/WebView'
import { AddNewDatabaseParameters } from '../types/types'
import { DatabaseAPIRequests } from '../api'
import { NotificationActions } from './actions'
import { KeyDetailsActions } from './KeyDetailsActions'

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
    // Check the notification message
    await NotificationActions.checkNotificationMessage(
      `Database has been added`,
    )
    // Verify that panel is closed
    KeyDetailsActions.verifyDetailsPanelClosed()
  }

  /**
   * Verify that success notification displayed when editing database
   */
  static async verifyDatabaseEdited(): Promise<void> {
    await CommonDriverExtension.driverSleep(1000)
    // Check the notification message
    await NotificationActions.checkNotificationMessage(
      `Database has been edited`,
    )
    // Verify that panel is closed
    KeyDetailsActions.verifyDetailsPanelClosed()
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
