import server from '../src/server'
import log from '../src/log'

export default async function globalSetup() {
  server.listen(4001, () => {
    log('Test server running')
  })
}
