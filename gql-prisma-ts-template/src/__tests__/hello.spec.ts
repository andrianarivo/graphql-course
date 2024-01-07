import buildExecutor from '../utils/buildExecutor'
import { hello } from '../utils/operations'
import { setupDatabase, tearDownDatabase } from '../utils/seedTestDatabase'

beforeAll(setupDatabase)
afterAll(async () => {
  await tearDownDatabase()
})

const executor = buildExecutor()

test('Should do Hello World!', async () => {
  const response = (await executor({
    document: hello,
  })) as { data: { hello: string } }

  expect(response.data.hello).toContain('Hello World!')
})
