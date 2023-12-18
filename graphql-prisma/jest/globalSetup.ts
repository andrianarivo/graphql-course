import server from "../src/server"

export default async function globalSetup() {
  server.listen(4000, () => {
    console.log('Test server running')
  })
}