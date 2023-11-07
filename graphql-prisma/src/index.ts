import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ log: ['query']})

async function main() {
  const users = await prisma.user.deleteMany()
  console.log(users)
}

main().catch(e => {
  console.error(e)
}).finally(async () => {
  await prisma.$disconnect()
})