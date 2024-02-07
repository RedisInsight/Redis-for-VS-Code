import type { StoreApi } from 'zustand'

export type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never
export type ReadonlyStoreApi<T> = Pick<StoreApi<T>, 'getState' | 'subscribe'>
export type WithReact<S extends ReadonlyStoreApi<unknown>> = S & {
  getServerState?: () => ExtractState<S>;
}

export type ZustandStore<T> = WithReact<StoreApi<T>>
