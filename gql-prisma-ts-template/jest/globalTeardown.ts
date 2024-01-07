import server from '../src/server'
import log from '../src/log'

export default async function globalTeardown() {
  server.close(() => {
    log('Test server closed')
  })
}
