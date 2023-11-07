import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ log: ['query']})

async function main() {
  const userPrefs = await prisma.userPreference.findMany()
  const user = await prisma.user.update({
    where: {
      id: 7
    },
    data: {
      userPreference: {
        connect: {
          id: userPrefs[0].id
        }
      }
    }
  })
  const updatedUser = await prisma.user.update({
    where: {
      id: 7
    },
    data: {
      userPreference: {
        disconnect: true
      }
    }
  })
  console.log(user, updatedUser)
}

main().catch(e => {
  console.error(e)
}).finally(async () => {
  await prisma.$disconnect()
})