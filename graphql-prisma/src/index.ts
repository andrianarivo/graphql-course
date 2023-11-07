import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ log: ['query']})

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      age_name: {
        age: 25,
        name: 'Bob'
      }
    }
  })
  const user2 = await prisma.user.findFirst({
    where: {
      name: 'Alice'
    }
  })
  const users = await prisma.user.findMany({
    take: 2,
    skip: 1,
    orderBy: {
      age: 'asc'
    }
  })
  const filteredUsers = await prisma.user.findMany({
    where: {
      OR: [
        {name: { not: 'Bob' }},
        {email: { endsWith: '.com' }}
      ],
      age: { lte: 20 },
      role: { in: ["ADMIN", "BASIC"]},
      writtenPosts: {
        every: {
          title: { contains: 'test'}
        }
      }
    }
  })
  const posts = await prisma.post.findMany({
    where: {
      author: {
        age: {
          gte: 25
        }
      }
    }
  })
  console.log(user, user2, users, filteredUsers, posts)
}

main().catch(e => {
  console.error(e)
}).finally(async () => {
  await prisma.$disconnect()
})