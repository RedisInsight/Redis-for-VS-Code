export interface IVSCodeApi {
  getState: () => any
  setState: (newState: any) => any
  postMessage: (message: any) => void
}
