import React from 'react'
import { instance, mock } from 'ts-mockito'
import { AdditionalRedisModule, DATABASE_LIST_MODULES_TEXT, RedisDefaultModules } from 'uiSrc/interfaces'
import { fireEvent, render } from 'testSrc/helpers'
import { Props, DatabaseModules } from './DatabaseModules'

const mockedProps = mock<Props>()

const modulesMock: AdditionalRedisModule[] = [
  { name: RedisDefaultModules.AI },
  { name: RedisDefaultModules.Bloom },
  { name: RedisDefaultModules.Gears },
  { name: RedisDefaultModules.Graph },
  { name: RedisDefaultModules.ReJSON },
  { name: RedisDefaultModules.Search },
  { name: RedisDefaultModules.TimeSeries },
]

describe('DatabaseListModules', () => {
  it('should render', () => {
    expect(render(<DatabaseModules {...instance(mockedProps)} modules={modulesMock} />)).toBeTruthy()
  })

  it('copy module name', async () => {
    const { queryByTestId } = render(
      <DatabaseModules {...instance(mockedProps)} modules={modulesMock} />,
    )

    const term = DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Search]

    const module = queryByTestId(`${term}_module`)

    module && fireEvent.click(module)

    expect(render(<DatabaseModules {...instance(mockedProps)} modules={modulesMock} />)).toBeTruthy()
  })
})
