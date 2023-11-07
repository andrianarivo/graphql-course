import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ log: ['query']})

async function main() {
  const user = await prisma.user.update({
    where: {
      id: 7
    },
    data: {
      email: 'test@example.com',
      age: {
        increment: 1
      }
    }
  })
  console.log(user)
}

main().catch(e => {
  console.error(e)
}).finally(async () => {
  await prisma.$disconnect()
})