import {schema} from "./schema"
import {lexicographicSortSchema, printSchema} from "graphql/utilities"
import {writeFileSync} from "node:fs";

const shchemaString = printSchema(lexicographicSortSchema(schema))

writeFileSync('src/schema.graphql', shchemaString)