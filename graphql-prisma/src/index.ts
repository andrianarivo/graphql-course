import server from "./server";

async function main() {
  server.listen(process.env.PORT || 4000, () => {
    console.info('Server is running on http://localhost:4000/graphql')
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})