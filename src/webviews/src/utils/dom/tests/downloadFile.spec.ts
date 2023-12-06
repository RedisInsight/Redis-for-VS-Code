import { saveAs } from 'file-saver'
import { vi } from 'vitest'
import { DEFAULT_FILE_NAME, downloadFile } from 'uiSrc/utils/dom/downloadFile'

vi.mock('file-saver', async () => ({
  ...(await vi.importActual<typeof import('file-saver')>('file-saver')),
  saveAs: vi.fn(),
}))

const getDownloadFileTests: any[] = [
  ['5123123123', { 'content-disposition': '123"123"123' }, '123'],
  ['test\ntest123', { 'content-disposition': '123"filename.txt"123' }, 'filename.txt'],
  ['5123 uoeu aoue ao123123', { 'content-disposition': '123"1uaoeutaoeu"123' }, '1uaoeutaoeu'],
  [null, { 'content-disposition': '123"123"123' }, '123'],
  ['5123 3', {}, DEFAULT_FILE_NAME],
]

describe.todo('downloadFile', () => {
  it.each(getDownloadFileTests)('saveAs should be called with: %s (data), %s (headers), ',
    (data: string, headers, fileName: string) => {
      const saveAsMock = vi.fn()
      saveAs.mockImplementation(() => saveAsMock)

      downloadFile(data, headers)
      expect(saveAs).toBeCalledWith(
        new Blob([data], { type: 'text/plain;charset=utf-8' }), fileName,
      )
    })
})
