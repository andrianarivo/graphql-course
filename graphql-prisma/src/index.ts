import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ log: ['query']})

async function main() {
  await prisma.user.deleteMany()
  const users = await prisma.user.createMany({
    data: [{
      name: 'Bob',
      email: 'bob@example.com',
      age: 25
    }, {
      name: 'Queen',
      email: 'spades@card.com',
      age: 55
    }]
  })
  console.log(users)
  const user = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@wonderland.com',
      age: 14,
      userPreference: {
        create: {
          emailUpdates: true,
        }
      }
    },
    /*include: {
      userPreference: true,
    }*/
    select: {
      id: true,
      name: true,
      userPreference: {
        select: {
          emailUpdates: true,
        }
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