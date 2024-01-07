import { lexicographicSortSchema, printSchema } from 'graphql/utilities'
import { writeFileSync } from 'node:fs'
import { schema } from '../schema'

const shchemaString = printSchema(lexicographicSortSchema(schema))

writeFileSync('src/schema.graphql', shchemaString)
