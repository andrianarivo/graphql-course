import {createSchema, createYoga, createPubSub} from 'graphql-yoga'
import {createServer} from 'http'
import {loadFiles} from "@graphql-tools/load-files"
import db from "./db"
import Query from "./resolvers/Query"
import Mutation from "./resolvers/Mutation"
import Comment from "./resolvers/Comment"
import User from "./resolvers/User"
import Post from "./resolvers/Post"
import Subscription from "./resolvers/Subscription"
import { Resolvers } from "./generated/graphql"
import {PubSubChannels} from "./types"
import {PrismaClient} from "@prisma/client"

async function main() {

  const prisma = new PrismaClient()

  const pubsub = createPubSub<PubSubChannels>()

  const typeDefs = await loadFiles('**/*.graphql')

  const resolvers: Resolvers = {
    Query,
    Mutation,
    Subscription,
    Post,
    User,
    Comment
  }

  const schema = createSchema({
    typeDefs,
    resolvers,
  })

  const yoga = createYoga({
    schema,
    context: { db, pubsub, prisma },
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