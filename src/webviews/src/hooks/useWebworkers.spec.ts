import { renderHook, waitFor } from '@testing-library/react'
import { useDisposableWebworker } from './useWebworkers'

describe.todo('useDisposableWebworker', () => {
  it('should run the worker and return the result', async () => {
    const { result } = renderHook(() => useDisposableWebworker((data) => data * 2))

    await waitFor(() => {
      result.current.run(2)
    })

    expect(result.current.result).toBe(4)
    expect(result.current.error).toBeNull()
  })

  it('should handle worker errors', async () => {
    const { result } = renderHook(() => useDisposableWebworker(() => {
      throw new Error('Worker error')
    }))

    waitFor(() => {
      result.current.run('input')
    })

    expect(result.current.result).toBeNull()
    expect(result.current.error).not.toBeNull()
    expect(result.current.error!.message).toBe('Worker error')
  })
})
