import SchemaBuilder from '@pothos/core'
import { DateResolver } from "graphql-scalars"
import {SchemaBuilderType} from "./types"
import PrismaPlugin from "@pothos/plugin-prisma"
import {prisma} from "./db"

export const builder = new SchemaBuilder<SchemaBuilderType>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma
  }
})

builder.queryType({})
builder.addScalarType('Date', DateResolver, {})