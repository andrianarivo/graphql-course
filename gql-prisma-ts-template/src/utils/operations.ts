import { parse } from 'graphql'

const hello = parse(/* GraphQL */ `
  query {
    hello
  }
`)

export { hello }
