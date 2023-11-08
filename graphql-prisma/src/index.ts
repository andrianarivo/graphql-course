import {createYoga, createPubSub} from 'graphql-yoga'
import {createServer} from 'http'
import db from "./db"
import {PubSubChannels} from "./types"
import {schema} from "./schema"

async function main() {

  const pubsub = createPubSub<PubSubChannels>()

  const yoga = createYoga({
    schema,
    context: { db, pubsub },
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