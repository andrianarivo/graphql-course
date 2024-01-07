import server from './server'
import log from './log'

function main() {
  server.listen(4000, () => {
    log(`Server is running on http://172.19.0.3:4000/graphql`)
  })
}

main()
