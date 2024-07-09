import { Chance } from 'chance'
import { Config } from './Conf'
import { By, Locator } from 'vscode-extension-tester'

const chance = new Chance()

export class Common {
  /**
   * Return api endpoint with disabled certificate validation
   */
  static getEndpoint(): string {
    return Config.apiUrl
  }

  /**
   * Generate word by number of symbols
   * @param number The number of symbols
   */
  static generateWord(number: number): string {
    return chance.word({ length: number })
  }

  /**
   * Generate sentence by number of words
   * @param number The number of words
   */
  static generateSentence(number: number): string {
    return chance.sentence({ words: number })
  }

  /**
   * Generate a string by number of symbols
   * @param number The number of symbols
   */
  static generateString(number: number): string {
    return chance.string({ length: number })
  }

  /**
   * Helper function to work with arr.filter() method with async functions
   * @param array The array
   * @param callback The callback function need to be processed
   */
  static async asyncFilter(
    array: string[],
    callback: (item: any) => Promise<boolean>,
  ): Promise<any[]> {
    const fail = Symbol()
    return (
      await Promise.all(
        array.map(async item => ((await callback(item)) ? item : fail)),
      )
    ).filter(i => i !== fail)
  }

  /**
   * Helper function to work with arr.find() method with async functions
   * @param array The array
   * @param asyncCallback The callback function need to be processed
   */
  static async asyncFind(
    array: string[],
    asyncCallback: (item: any) => Promise<boolean>,
  ): Promise<string> {
    const index = (await Promise.all(array.map(asyncCallback))).findIndex(
      result => result,
    )
    return array[index]
  }

  /**
   * Helper function for waiting until promise be resolved
   */
  static doAsyncStuff(): Promise<void> {
    return Promise.resolve()
  }

  /**
   * Create array of numbers
   * @param length The amount of array elements
   */
  static async createArray(length: number): Promise<string[]> {
    const arr: string[] = []
    for (let i = 1; i <= length; i++) {
      arr[i] = `${i}`
    }
    return arr
  }

  /**
   * Create array of keys and values
   * @param length The amount of array elements
   */
  static async createArrayWithKeyValue(length: number): Promise<string[]> {
    const arr: string[] = []
    for (let i = 1; i <= length * 2; i++) {
      arr[i] = `${chance.word({ length: 10 })}-key${i}`
      arr[i + 1] = `${chance.word({ length: 10 })}-value${i}`
      i++
    }
    return arr
  }

  /**
   * Format json string to normal
   * @param input The input to format
   */
  static formatJsonString(input: string): string {
    // Remove whitespace characters except those within the value
    const withoutWhitespace = input.replace(/\s+/g, '')
    // Ensure colons have no spaces around them
    const formattedString = withoutWhitespace.replace(/:/g, ':')
    return formattedString
  }

  /**
   * Modify locator by adding additional path
   * @param locator The locator to modify
   * @param path The path to add to locator
   */
  static async modifyLocator(locator: Locator, path: string): Promise<Locator> {
    const locatorString = locator.toString()
    let originalXPath: string
    if (locatorString.startsWith('By(xpath, ')) {
      originalXPath = locatorString.replace('By(xpath, ', '').replace(')', '')
    } else {
      throw new Error('Provided locator is not an XPath locator.')
    }

    // Adjust the XPath to locate the correct element to click
    const newXPath = `${originalXPath}` + `${path}`

    // Create a new locator using the adjusted XPath
    return By.xpath(newXPath)
  }
}
