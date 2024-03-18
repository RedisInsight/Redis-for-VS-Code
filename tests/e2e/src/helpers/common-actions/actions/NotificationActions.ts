import { VSBrowser, Workbench } from 'vscode-extension-tester'
import { expect } from 'chai'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'
import { By } from 'selenium-webdriver'

/**
 * Notifications
 */
export class NotificationActions {
  /**
   * Check Notification message text
   * @param text Text inside of notification
   */
  static async checkNotificationMessage(text: string): Promise<void> {
    await CommonDriverExtension.driverSleep(1000)
    let notifications = await new Workbench().getNotifications()
    let notificationFound = false
    for (const notification of notifications) {
      let message = await notification.getMessage()
      if (message === text) {
        notificationFound = true
        break
      }
    }
    expect(notificationFound).eql(
      true,
      `No notification found with the text: ${text}`,
    )
  }

  // it does not work for now - can't find elements
  /**
   * close all notifications
   */
  static async closeAllNotifications(): Promise<void> {
    const closeNotification = By.xpath(
      `//a[contains(@class,'codicon-notifications-clear')]`,
    )
    const elements =
      await CommonDriverExtension.driver.findElements(closeNotification)
    let notifications = await new Workbench().getNotifications()
    console.log(notifications.length)
    for (const element of elements) {
      await element.click()
    }
  }
}
