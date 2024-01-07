import SchemaBuilder from '@pothos/core'
import { DateResolver } from 'graphql-scalars'
import PrismaPlugin from '@pothos/plugin-prisma'
import { SchemaBuilderType } from './types'
import { prisma } from './db'
import { MutationType } from './pubsub'

export const builder = new SchemaBuilder<SchemaBuilderType>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
  },
})

builder.enumType(MutationType, {
  name: 'MutationType',
})
builder.queryType({})
builder.mutationType({})
builder.subscriptionType({})

builder.addScalarType('Date', DateResolver, {})
