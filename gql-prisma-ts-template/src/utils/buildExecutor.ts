import { buildHTTPExecutor } from '@graphql-tools/executor-http'
import { yoga } from '../server'

export default function buildExecutor(token?: string) {
  if (token) {
    return buildHTTPExecutor({
      fetch: yoga.fetch,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }
  return buildHTTPExecutor({
    fetch: yoga.fetch,
  })
}
