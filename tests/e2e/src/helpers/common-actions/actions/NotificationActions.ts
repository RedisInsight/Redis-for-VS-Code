import { Workbench } from 'vscode-extension-tester'
import { expect } from 'chai'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'

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
    await NotificationActions.closeNotification()
  }
  /**
   * Close all notifications
   */
  static async closeAllNotifications(): Promise<void> {
    const notifications = await new Workbench().getNotifications()
    for (const notification of notifications) {
      await notification.dismiss()
    }
  }

  /**
   * Close first Notification
   */
  static async closeNotification(): Promise<void> {
    await CommonDriverExtension.driverSleep(1000)
    let notifications = await new Workbench().getNotifications()
    const notification = notifications[0]
    // dismiss the notification
    await notification.dismiss()
  }
}
