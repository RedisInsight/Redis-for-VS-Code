/* eslint-disable react/destructuring-assignment */
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import { SubmitBtnText } from 'uiSrc/constants'
import {
  ManualConnectionFormProps,
  ManualConnectionForm,
} from 'uiSrc/modules/manual-connection/manual-connection-form'
import { fireEvent, render, screen, waitFor } from 'testSrc/helpers'
import { ManualConnection, Props } from './ManualConnection'

const mockedProps = mock<Props>()

vi.mock('uiSrc/modules/manual-connection/manual-connection-form', async () => ({
  // ...(await vi.importActual<object>('uiSrc/modules/manual-connection/manual-connection-form')),
  // ManualConnectionForm: vi.fn().mockImplementation(mockManualConnectionForm),
  ManualConnectionForm: vi.fn(),
}))

vi.mock('uiSrc/utils', async () => ({
  ...(await vi.importActual<object>('uiSrc/utils')),
  sendEventTelemetry: vi.fn(),
}))

const mockManualConnectionForm = (props: ManualConnectionFormProps) => (
  <div>
    <button
      type="button"
      onClick={() => props.onHostNamePaste('redis-12000.cluster.local:12000')}
      data-testid="onHostNamePaste-btn"
    >
      onHostNamePaste
    </button>
    <button
      type="button"
      onClick={() => props.onClose()}
      data-testid="onClose-btn"
    >
      onClose
    </button>
    <button
      type="submit"
      data-testid="btn-submit"
      onClick={() => props.onSubmit({})}
    >
      {props.submitButtonText}
    </button>
    <button
      type="button"
      onClick={() => props.setIsCloneMode(!props.isCloneMode)}
      data-testid="onClone-btn"
    >
      onClone
    </button>
  </div>
)

describe('ManualConnection', () => {
  beforeAll(() => {
    ManualConnectionForm.mockImplementation(mockManualConnectionForm)
  })
  it('should render', () => {
    expect(
      render(<ManualConnection {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it.only('should call onHostNamePaste', () => {
    const component = render(<ManualConnection {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('onHostNamePaste-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onClose', () => {
    const onClose = vi.fn()
    render(<ManualConnection {...instance(mockedProps)} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('onClose-btn'))
    expect(onClose).toBeCalled()
  })

  it('should have add database submit button', () => {
    render(<ManualConnection {...instance(mockedProps)} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent(SubmitBtnText.AddDatabase)
  })

  it('should have edit database submit button', () => {
    render(<ManualConnection {...instance(mockedProps)} editMode />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent(SubmitBtnText.EditDatabase)
  })

  it('should have edit database submit button', () => {
    render(<ManualConnection {...instance(mockedProps)} editMode />)
    waitFor(() => {
      fireEvent.click(screen.getByTestId('onClone-btn'))
    })
    expect(screen.getByTestId('btn-submit')).toHaveTextContent(SubmitBtnText.CloneDatabase)
  })

  it('should call proper telemetry event on Add database', () => {
    const sendEventTelemetryMock = vi.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    sendEventTelemetry.mockRestore()
    render(<ManualConnection {...instance(mockedProps)} />)
    waitFor(() => {
      fireEvent.click(screen.getByTestId('btn-submit'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_MANUALLY_SUBMITTED,
    })
  })

  it('should call proper telemetry event on Clone database', () => {
    const sendEventTelemetryMock = vi.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    sendEventTelemetry.mockRestore()
    render(<ManualConnection {...instance(mockedProps)} editMode />)
    waitFor(() => {
      fireEvent.click(screen.getByTestId('onClone-btn'))
    })
    waitFor(() => {
      fireEvent.click(screen.getByTestId('onClose-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_CANCELLED,
      eventData: { databaseId: undefined },
    })
  })
})
