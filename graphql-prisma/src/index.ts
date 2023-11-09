import {createYoga} from 'graphql-yoga'
import {createServer} from 'http'
import {schema} from "./schema"
import { pubsub } from "./pubsub";

async function main() {


  const yoga = createYoga({
    schema,
    context: { pubsub }
  })

  const server = createServer(yoga)

  server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql')
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})