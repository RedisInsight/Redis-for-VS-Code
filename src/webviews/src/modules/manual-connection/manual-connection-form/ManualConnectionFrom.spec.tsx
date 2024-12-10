import React from 'react'
import { instance, mock } from 'ts-mockito'
import { ConnectionType, DbConnectionInfo } from 'uiSrc/interfaces'
import { ADD_NEW_CA_CERT, SshPassType } from 'uiSrc/constants'
import { waitFor, fireEvent, render, screen, waitForStack } from 'testSrc/helpers'

import { ManualConnectionForm, Props } from './ManualConnectionForm'

const BTN_SUBMIT = 'btn-submit'
const NEW_CA_CERT = 'new-ca-cert'
const QA_CA_CERT = 'qa-ca-cert'
// const RADIO_BTN_PRIVATE_KEY = '[data-test-subj="radio-btn-privateKey"] label'
const RADIO_BTN_PRIVATE_KEY = 'radio-btn-privateKey'
const BTN_TEST_CONNECTION = 'btn-test-connection'

const mockedProps = mock<Props>()
const mockedDbConnectionInfo = mock<DbConnectionInfo>()

const formFields = {
  ...instance(mockedDbConnectionInfo),
  host: 'localhost',
  port: '6379',
  name: 'lala',
}

vi.mock('uiSrc/slices/instances/instances', () => ({
  checkConnectToInstanceAction: () => vi.fn,
  resetInstanceUpdateAction: () => vi.fn,
  changeInstanceAliasAction: () => vi.fn,
  setConnectedInstanceId: vi.fn,
}))

describe('DatabaseForm', () => {
  it('should render', () => {
    expect(
      render(
        <ManualConnectionForm {...instance(mockedProps)} formFields={formFields} />,
      ),
    ).toBeTruthy()
  })

  it('should render with ConnectionType.Sentinel', () => {
    expect(
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Sentinel,
          }}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render with ConnectionType.Cluster', () => {
    expect(
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{ ...formFields, connectionType: ConnectionType.Cluster }}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render tooltip with nodes', () => {
    expect(
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            nodes: [{ host: '1', port: 1 }],
            connectionType: ConnectionType.Cluster,
          }}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render DatabaseForm', () => {
    expect(
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode={false}
          formFields={{
            ...formFields,
            tls: true,
            caCert: { id: '123' },
            host: '123',
            tlsClientAuthRequired: true,
            nodes: [{ host: '1', port: 1 }],
            connectionType: ConnectionType.Cluster,
          }}
        />,
      ),
    ).toBeTruthy()
  })

  it.skip('should change sentinelMasterUsername input properly', async () => {
    const handleSubmit = vi.fn()
    const handleTestConnection = vi.fn()

    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Sentinel,
          }}
          onSubmit={handleSubmit}
          // onTestConnection={handleTestConnection}
        />
      </div>,
    )

    await waitFor(() => {
      fireEvent.change(screen.getByTestId('sentinel-mater-username'), {
        target: { value: 'user' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    // const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)

    // await waitFor(() => {
    //   fireEvent.click(testConnectionBtn)
    // })
    // expect(handleTestConnection).toBeCalledWith(
    //   expect.objectContaining({
    //     sentinelMasterUsername: 'user',
    //   }),
    // )

    await waitFor(() => {
      fireEvent.click(submitBtn)
    })
    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        sentinelMasterUsername: 'user',
      }),
    )
  })

  it('should change port input properly', async () => {
    const handleSubmit = vi.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    await waitFor(() => {
      fireEvent.change(screen.getByTestId('port'), {
        target: { value: '123' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    await waitFor(() => {
      fireEvent.click(submitBtn)
    })
    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        port: '123',
      }),
    )
  })

  it('should change tls checkbox', async () => {
    const handleSubmit = vi.fn()
    const handleTestConnection = vi.fn()

    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
          // onTestConnection={handleTestConnection}
        />
      </div>,
    )
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('tls'))
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    // const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)

    // await waitFor(() => {
    //   fireEvent.click(testConnectionBtn)
    // })
    // expect(handleTestConnection).toBeCalledWith(
    //   expect.objectContaining({
    //     tls: true,
    //   }),
    // )

    await waitFor(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        tls: true,
      }),
    )
  })

  it('should change "Use SNI" with prepopulated with host', async () => {
    const handleSubmit = vi.fn()
    const handleTestConnection = vi.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: true,
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
          // onTestConnection={handleTestConnection}
        />
      </div>,
    )
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('sni'))
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    // const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)
    // await waitFor(() => {
    //   fireEvent.click(testConnectionBtn)
    // })
    // expect(handleTestConnection).toBeCalledWith(
    //   expect.objectContaining({
    //     sni: true,
    //     servername: formFields.host,
    //   }),
    // )
    await waitFor(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        sni: true,
        servername: formFields.host,
      }),
    )
  })

  it('should change "Use SNI"', async () => {
    const handleSubmit = vi.fn()
    const handleTestConnection = vi.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: true,
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
          // onTestConnection={handleTestConnection}
        />
      </div>,
    )
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('sni'))
    })

    await waitFor(() => {
      fireEvent.change(screen.getByTestId('sni-servername'), {
        target: { value: '12' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    // const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)
    // await waitFor(() => {
    //   fireEvent.click(testConnectionBtn)
    // })
    // expect(handleTestConnection).toBeCalledWith(
    //   expect.objectContaining({
    //     sni: true,
    //     servername: '12',
    //   }),
    // )
    await waitFor(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        sni: true,
        servername: '12',
      }),
    )
  })

  it('should change "Verify TLS Certificate"', async () => {
    const handleSubmit = vi.fn()
    const handleTestConnection = vi.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: true,
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
          // onTestConnection={handleTestConnection}
        />
      </div>,
    )
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('verify-tls-cert'))
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    // const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)
    // await waitFor(() => {
    //   fireEvent.click(testConnectionBtn)
    // })
    // expect(handleTestConnection).toBeCalledWith(
    //   expect.objectContaining({
    //     verifyServerTlsCert: true,
    //   }),
    // )
    await waitFor(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        verifyServerTlsCert: true,
      }),
    )
  })

  it('should select value from "CA Certificate"', async () => {
    const handleSubmit = vi.fn()
    const handleTestConnection = vi.fn()
    const { queryAllByText } = render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: true,
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
          // onTestConnection={handleTestConnection}
        />
      </div>,
    )
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('select-ca-cert'))
    })
    await waitFor(() => {
      fireEvent.click(queryAllByText('Add new CA certificate')[0] || document)
    })

    expect(screen.getByTestId(NEW_CA_CERT)).toBeInTheDocument()
    await waitFor(() => {
      fireEvent.change(screen.getByTestId(NEW_CA_CERT), {
        target: { value: '123' },
      })
    })

    expect(screen.getByTestId(QA_CA_CERT)).toBeInTheDocument()
    await waitFor(() => {
      fireEvent.change(screen.getByTestId(QA_CA_CERT), {
        target: { value: '321' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    // const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)
    // await waitFor(() => {
    //   fireEvent.click(testConnectionBtn)
    // })
    // expect(handleTestConnection).toBeCalledWith(
    //   expect.objectContaining({
    //     selectedCaCertName: ADD_NEW_CA_CERT,
    //     newCaCertName: '321',
    //     newCaCert: '123',
    //   }),
    // )
    await waitFor(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        selectedCaCertName: ADD_NEW_CA_CERT,
        newCaCertName: '321',
        newCaCert: '123',
      }),
    )
  })

  it('should render fields for add new CA and change them properly', async () => {
    const handleSubmit = vi.fn()
    const handleTestConnection = vi.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: true,
            connectionType: ConnectionType.Cluster,
            selectedCaCertName: 'ADD_NEW_CA_CERT',
          }}
          onSubmit={handleSubmit}
          // onTestConnection={handleTestConnection}
        />
      </div>,
    )

    expect(screen.getByTestId(QA_CA_CERT)).toBeInTheDocument()
    await waitFor(() => {
      fireEvent.change(screen.getByTestId(QA_CA_CERT), {
        target: { value: '321' },
      })
    })

    expect(screen.getByTestId(NEW_CA_CERT)).toBeInTheDocument()
    await waitFor(() => {
      fireEvent.change(screen.getByTestId(NEW_CA_CERT), {
        target: { value: '123' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    // const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)
    // await waitFor(() => {
    //   fireEvent.click(testConnectionBtn)
    // })
    // expect(handleTestConnection).toBeCalledWith(
    //   expect.objectContaining({
    //     newCaCert: '123',
    //     newCaCertName: '321',
    //   }),
    // )
    await waitFor(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        newCaCert: '123',
        newCaCertName: '321',
      }),
    )
  })

  it('should change "Requires TLS Client Authentication"', async () => {
    const handleSubmit = vi.fn()
    const handleTestConnection = vi.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: true,
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
          // onTestConnection={handleTestConnection}
        />
      </div>,
    )
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('tls-required-checkbox'))
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    // const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)
    // await waitFor(() => {
    //   fireEvent.click(testConnectionBtn)
    // })
    // expect(handleTestConnection).toBeCalledWith(
    //   expect.objectContaining({
    //     tlsClientAuthRequired: true,
    //   }),
    // )
    await waitFor(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        tlsClientAuthRequired: true,
      }),
    )
  })

  it('should render fields for add new CA with required tls auth and change them properly', async () => {
    const handleSubmit = vi.fn()
    const { container } = render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: true,
            connectionType: ConnectionType.Standalone,
            selectedCaCertName: 'NO_CA_CERT',
            tlsClientAuthRequired: true,
            selectedTlsClientCertId: 'ADD_NEW',
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    expect(screen.getByTestId('select-cert')).toBeInTheDocument()

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('select-cert'))
    })

    await waitFor(() => {
      fireEvent.click(
        container.querySelectorAll('.euiContextMenuItem__text')[0] || document,
      )
    })

    expect(screen.getByTestId('new-tsl-cert-pair-name')).toBeInTheDocument()
    await waitFor(() => {
      fireEvent.change(screen.getByTestId('new-tsl-cert-pair-name'), {
        target: { value: '123' },
      })
    })

    expect(screen.getByTestId('new-tls-client-cert')).toBeInTheDocument()
    await waitFor(() => {
      fireEvent.change(screen.getByTestId('new-tls-client-cert'), {
        target: { value: '321' },
      })
    })

    expect(screen.getByTestId('new-tls-client-cert-key')).toBeInTheDocument()
    await waitFor(() => {
      fireEvent.change(screen.getByTestId('new-tls-client-cert-key'), {
        target: { value: '231' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)

    await waitFor(() => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        newTlsClientCert: '321',
        newTlsCertPairName: '123',
        newTlsClientKey: '231',
      }),
    )
  })

  it.skip('should render clone mode btn', () => {
    render(
      <ManualConnectionForm
        {...instance(mockedProps)}
        isEditMode
        formFields={{
          ...formFields,
          connectionType: ConnectionType.Standalone,
        }}
      />,
    )
    expect(screen.getByTestId('clone-db-btn')).toBeTruthy()
  })

  describe.todo('should render proper fields with Clone mode', () => {
    it('should render proper fields for standalone db', () => {
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          isCloneMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
        />,
      )
      const fieldsTestIds = ['host', 'port', 'username', 'password', 'showDb', 'tls']
      fieldsTestIds.forEach((id) => {
        expect(screen.getByTestId(id)).toBeTruthy()
      })
    })

    it('should render proper fields for sentinel db', () => {
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          isCloneMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Sentinel,
          }}
        />,
      )
      const fieldsTestIds = [
        'name',
        'primary-group',
        'sentinel-mater-username',
        'sentinel-master-password',
        'host',
        'port',
        'username',
        'password',
        'showDb',
        'tls',
      ]
      fieldsTestIds.forEach((id) => {
        expect(screen.getByTestId(id)).toBeTruthy()
      })
    })

    it('should render proper database alias', () => {
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          isCloneMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
        />,
      )
      expect(screen.getByTestId('db-alias')).toHaveTextContent('Clone ')
    })

  //   it('should render proper default values for standalone', () => {
  //     render(
  //       <ManualConnectionForm
  //         {...instance(mockedProps)}
  //         formFields={{}}
  //       />
  //     )
  //     expect(screen.getByTestId('host')).toHaveValue('127.0.0.1')
  //     expect(screen.getByTestId('port')).toHaveValue('6379')
  //     expect(screen.getByTestId('name')).toHaveValue('127.0.0.1:6379')
  //   })
  })

  it('should change Use SSH checkbox', async () => {
    const handleSubmit = vi.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('use-ssh'))
    })

    expect(screen.getByTestId('use-ssh')).toBeChecked()
  })

  it('should change Use SSH checkbox and show proper fields for password radio', async () => {
    const handleSubmit = vi.fn()
    const { getByTestId, queryByTestId } = render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            sshPassType: SshPassType.Password,
            connectionType: ConnectionType.Standalone,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    await waitFor(() => {
      fireEvent.click(getByTestId('use-ssh')!)
    })

    expect(getByTestId('sshHost')).toBeInTheDocument()
    expect(getByTestId('sshPort')).toBeInTheDocument()
    expect(getByTestId('sshPassword')).toBeInTheDocument()
    expect(queryByTestId('sshPrivateKey')).not.toBeInTheDocument()
    expect(queryByTestId('sshPassphrase')).not.toBeInTheDocument()

    const submitBtn = getByTestId(BTN_SUBMIT)
    expect(submitBtn).toBeDisabled()
  })

  it('should change Use SSH checkbox and show proper fields for passphrase radio', async () => {
    const handleSubmit = vi.fn()
    const { getByTestId, queryByTestId } = render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    await waitFor(() => {
      fireEvent.click(getByTestId('use-ssh'))
    })
    await waitFor(() => {
      fireEvent.click(
        getByTestId(RADIO_BTN_PRIVATE_KEY) as HTMLLabelElement,
      )
    })

    expect(getByTestId('sshHost')).toBeInTheDocument()
    expect(getByTestId('sshPort')).toBeInTheDocument()
    expect(queryByTestId('sshPassword')).not.toBeInTheDocument()
    expect(getByTestId('sshPrivateKey')).toBeInTheDocument()
    expect(getByTestId('sshPassphrase')).toBeInTheDocument()

    // const submitBtn = getByTestId(BTN_SUBMIT)
    // expect(submitBtn).toBeDisabled()
  })

  it('should be proper validation for ssh via ssh password', async () => {
    const handleSubmit = vi.fn()
    const { queryByTestId } = render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
            sshPassType: SshPassType.Password,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    expect(queryByTestId(BTN_SUBMIT)).not.toBeDisabled()

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('use-ssh'))
    })

    expect(screen.getByTestId('sshHost')).toBeInTheDocument()
    expect(screen.getByTestId('sshPort')).toBeInTheDocument()

    await waitForStack()
    expect(queryByTestId(BTN_SUBMIT)).toBeDisabled()

    await waitFor(() => {
      fireEvent.change(
        screen.getByTestId('sshHost'),
        { target: { value: 'localhost' } },
      )
    })

    expect(screen.getByTestId('sshHost')).toBeInTheDocument()
    expect(screen.getByTestId('sshPort')).toBeInTheDocument()

    await waitFor(() => {
      fireEvent.change(
        screen.getByTestId('sshUsername'),
        { target: { value: 'username' } },
      )
    })

    await waitForStack()
    expect(queryByTestId(BTN_SUBMIT)).toBeDisabled()

    await waitFor(() => {
      fireEvent.change(
        screen.getByTestId('sshPort'),
        { target: { value: '22' } },
      )
    })

    await waitForStack()
    expect(queryByTestId(BTN_SUBMIT)).not.toBeDisabled()
  })

  it('should be proper validation for ssh via ssh passphrase', async () => {
    const handleSubmit = vi.fn()
    const { getByTestId } = render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
            sshPassType: SshPassType.Password,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    expect(screen.getByTestId(BTN_SUBMIT)).not.toBeDisabled()

    await waitFor(() => {
      fireEvent.click(getByTestId('use-ssh'))
      fireEvent.click(
        getByTestId(RADIO_BTN_PRIVATE_KEY) as HTMLLabelElement,
      )
    })

    expect(getByTestId(BTN_SUBMIT)).toBeDisabled()

    await waitFor(() => {
      fireEvent.change(
        getByTestId('sshHost'),
        { target: { value: 'localhost' } },
      )
      fireEvent.change(
        getByTestId('sshPort'),
        { target: { value: '22' } },
      )
      fireEvent.change(
        getByTestId('sshUsername'),
        { target: { value: 'username' } },
      )
    })

    await waitForStack()

    expect(getByTestId(BTN_SUBMIT)).toBeDisabled()

    await waitFor(() => {
      fireEvent.change(
        getByTestId('sshPrivateKey'),
        { target: { value: 'PRIVATEKEY' } },
      )
    })

    expect(getByTestId(BTN_SUBMIT)).not.toBeDisabled()
  })

  it('should call submit btn with proper fields', async () => {
    const handleSubmit = vi.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
            sshPassType: SshPassType.Password,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('use-ssh'))
    })

    await waitFor(() => {
      fireEvent.change(
        screen.getByTestId('sshHost'),
        { target: { value: 'localhost' } },
      )

      fireEvent.change(
        screen.getByTestId('sshPort'),
        { target: { value: '1771' } },
      )

      fireEvent.change(
        screen.getByTestId('sshUsername'),
        { target: { value: 'username' } },
      )

      fireEvent.change(
        screen.getByTestId('sshPassword'),
        { target: { value: '123' } },
      )
    })

    await waitFor(() => {
      fireEvent.click(screen.getByTestId(BTN_SUBMIT))
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        sshHost: 'localhost',
        sshPort: '1771',
        sshUsername: 'username',
        sshPassword: '123',
      }),
    )
  })

  it('should call submit btn with proper fields via passphrase', async () => {
    const handleSubmit = vi.fn()
    const { container } = render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('use-ssh'))
      fireEvent.click(
        screen.getByTestId(RADIO_BTN_PRIVATE_KEY) as HTMLLabelElement,
      )
    })

    await waitFor(() => {
      fireEvent.change(
        screen.getByTestId('sshHost'),
        { target: { value: 'localhost' } },
      )

      fireEvent.change(
        screen.getByTestId('sshPort'),
        { target: { value: '1771' } },
      )

      fireEvent.change(
        screen.getByTestId('sshUsername'),
        { target: { value: 'username' } },
      )

      fireEvent.change(
        screen.getByTestId('sshPrivateKey'),
        { target: { value: '123444' } },
      )

      fireEvent.change(
        screen.getByTestId('sshPassphrase'),
        { target: { value: '123444' } },
      )
    })

    await waitFor(() => {
      fireEvent.click(screen.getByTestId(BTN_SUBMIT))
    })

    expect(handleSubmit).toBeCalledWith(
      expect.objectContaining({
        sshHost: 'localhost',
        sshPort: '1771',
        sshUsername: 'username',
        sshPrivateKey: '123444',
        sshPassphrase: '123444',
      }),
    )
  })

  it('should render password input with 10_000 length limit', () => {
    render(
      <ManualConnectionForm
        {...instance(mockedProps)}
        formFields={{ ...formFields, connectionType: ConnectionType.Standalone }}
      />,
    )

    expect(screen.getByTestId('password')).toHaveAttribute('maxLength', '10000')
  })

  it('should render security fields with proper attributes', () => {
    render(
      <ManualConnectionForm
        {...instance(mockedProps)}
        formFields={{
          ...formFields,
          connectionType: ConnectionType.Standalone,
          ssh: true,
          password: true,
          sshPassphrase: true,
          sshPassType: SshPassType.PrivateKey,
        }}
      />,
    )

    expect(screen.getByTestId('password')).toHaveAttribute('value', '••••••••••••')
    expect(screen.getByTestId('password')).toHaveAttribute('type', 'password')
    expect(screen.getByTestId('sshPassphrase')).toHaveAttribute('value', '••••••••••••')
    expect(screen.getByTestId('sshPassphrase')).toHaveAttribute('type', 'password')

    fireEvent.focus(screen.getByTestId('password'))
    fireEvent.focus(screen.getByTestId('sshPassphrase'))

    expect(screen.getByTestId('password')).toHaveAttribute('value', '')
    expect(screen.getByTestId('sshPassphrase')).toHaveAttribute('value', '')
  })

  it('should render ssh password with proper attributes', () => {
    render(
      <ManualConnectionForm
        {...instance(mockedProps)}
        formFields={{
          ...formFields,
          connectionType: ConnectionType.Standalone,
          ssh: true,
          sshPassword: true,
          sshPassType: SshPassType.Password,
        }}
      />,
    )

    expect(screen.getByTestId('sshPassword')).toHaveAttribute('value', '••••••••••••')
    expect(screen.getByTestId('sshPassword')).toHaveAttribute('type', 'password')

    fireEvent.focus(screen.getByTestId('sshPassword'))

    expect(screen.getByTestId('sshPassword')).toHaveAttribute('value', '')
  })

  it('should render ssh password input with 10_000 length limit', () => {
    render(
      <ManualConnectionForm
        {...instance(mockedProps)}
        formFields={{
          ...formFields,
          connectionType: ConnectionType.Standalone,
          ssh: true,
          sshPassType: SshPassType.Password,
        }}
      />,
    )

    expect(screen.getByTestId('sshPassword')).toHaveAttribute('maxLength', '10000')
  })

  describe('timeout', () => {
    it('should render timeout input with 7 length limit and 1_000_000 value', () => {
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{ ...formFields, timeout: '30' }}
        />,
      )

      expect(screen.getByTestId('timeout')).toBeInTheDocument()
      expect(screen.getByTestId('timeout')).toHaveAttribute('maxLength', '7')

      fireEvent.change(
        screen.getByTestId('timeout'),
        { target: { value: '2000000' } },
      )

      expect(screen.getByTestId('timeout')).toHaveAttribute('value', '1000000')
    })

    it('should put only numbers', () => {
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{ ...formFields, timeout: '30' }}
        />,
      )

      fireEvent.change(
        screen.getByTestId('timeout'),
        { target: { value: '11a2EU$#@' } },
      )

      expect(screen.getByTestId('timeout')).toHaveAttribute('value', '112')
    })
  })

  describe('cloud', () => {
    it.skip('some fields should be readonly if instance data source from cloud', () => {
      // (appRedirectionSelector as vi.Mock).mockImplementation(() => ({
      //   action: UrlHandlingActions.Connect,
      // }))

      const { queryByTestId } = render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={formFields}
        />,
      )

      expect(queryByTestId('connection-type')).not.toBeInTheDocument()
      expect(queryByTestId('host')).not.toBeInTheDocument()
      expect(queryByTestId('port')).not.toBeInTheDocument()
      expect(queryByTestId('db-info-port')).toBeInTheDocument()
      expect(queryByTestId('db-info-host')).toBeInTheDocument()
    })
  })

  it('should call submit on press Enter', async () => {
    const handleSubmit = vi.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={formFields}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    await waitFor(() => {
      fireEvent.keyDown(screen.getByTestId('form'), { key: 'Enter', code: 13, charCode: 13 })
    })
    expect(handleSubmit).toBeCalled()
  })
})
