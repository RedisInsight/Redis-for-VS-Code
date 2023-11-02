import { StorageService } from '../storage'

describe('StorageService', () => {
  const mockStorage: any = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  }

  const storageService = new StorageService(mockStorage)

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should get an item from storage', () => {
    mockStorage.getItem.mockReturnValue('{"key":"value"}')
    const result = storageService.get('itemKey')
    expect(result).toEqual({ key: 'value' })
    expect(mockStorage.getItem).toHaveBeenCalledWith('itemKey')
  })

  it('should handle invalid JSON during get', () => {
    mockStorage.getItem.mockReturnValue('invalid-json')
    const result = storageService.get('itemKey')
    expect(result).toEqual('invalid-json')
    expect(mockStorage.getItem).toHaveBeenCalledWith('itemKey')
  })

  it('should set an item in storage', () => {
    storageService.set('itemKey', { key: 'value' })
    expect(mockStorage.setItem).toHaveBeenCalledWith('itemKey', '{"key":"value"}')
  })

  it('should remove an item from storage', () => {
    storageService.remove('itemKey')
    expect(mockStorage.removeItem).toHaveBeenCalledWith('itemKey')
  })
})
