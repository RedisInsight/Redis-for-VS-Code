import { compareConsents, isDifferentConsentsExists } from 'uiSrc/utils'

const spec = {
  agreements: {
    eula: {
      defaultValue: false,
      required: true,
      editable: false,
      since: '1.0.2',
      title: 'EULA: Redis for VS Code License Terms',
      label: 'Label',
    },
  },
}

describe('compareConsents', () => {
  it('compareConsents should return array of difference of consents', () => {
    const agreements1 = {
      eula: true,
      version: '1.0.2',
    }

    const agreements2 = {
      eula: true,
      eulaNew: false,
      version: '1.0.2',
    }

    const agreements3 = {
      eula: false,
      version: '1.0.0',
    }

    expect(compareConsents(spec.agreements, agreements1)).toHaveLength(0)
    expect(compareConsents(spec.agreements, agreements2)).toHaveLength(0)
    expect(compareConsents(spec.agreements, agreements3)).toHaveLength(1)
  })
})

describe('isDifferentConsentsExists', () => {
  it('isDifferentConsentsExists should return true if some difference in consents', () => {
    const agreements1 = {
      eula: true,
      version: '1.0.2',
    }

    const agreements2 = {
      eula: true,
      eulaNew: false,
      version: '1.0.2',
    }

    const agreements3 = {
      eula: false,
      version: '1.0.0',
    }

    expect(isDifferentConsentsExists(spec.agreements, agreements1)).toBeFalsy()
    expect(isDifferentConsentsExists(spec.agreements, agreements2)).toBeFalsy()
    expect(isDifferentConsentsExists(spec.agreements, agreements3)).toBeTruthy()
  })
})

describe('compareConsents: custom keytar encryption conditions', () => {
  const agreementsSpec = {
    eula: spec.agreements.eula,
    encryption: {
      defaultValue: true,
      displayInSetting: false,
      required: false,
      editable: true,
      disabled: false,
      category: 'privacy',
      since: '1.0.2',
      title: 'Encryption',
      label: 'Encrypt sensitive information',
      description:
        'Select to encrypt sensitive information using system keychain. Otherwise, this information is stored locally in plain text, which may incur security risk.',
    },
  }

  it('should prompt users with encryption set to false and v1.0.6 to set encryption again', () => {
    const agreements = {
      eula: true,
      encryption: false,
      version: '1.0.6',
    }

    expect(compareConsents(agreementsSpec, agreements)).toHaveLength(1)
  })

  it('should NOT prompt users with encryption set to false and v1.0.7 to set encryption again', () => {
    const agreements = {
      eula: true,
      encryption: false,
      version: '1.0.7',
    }

    expect(compareConsents(agreementsSpec, agreements)).toHaveLength(0)
  })

  it('should NOT prompt users with encryption set to true and v1.0.6 to set encryption again', () => {
    const agreements = {
      eula: true,
      encryption: true,
      version: '1.0.6',
    }

    expect(compareConsents(agreementsSpec, agreements)).toHaveLength(0)
  })

  it('should NOT prompt users with encryption set to true and v1.0.7 to set encryption again', () => {
    const agreements = {
      eula: true,
      encryption: true,
      version: '1.0.7',
    }

    expect(compareConsents(agreementsSpec, agreements)).toHaveLength(0)
  })
})
