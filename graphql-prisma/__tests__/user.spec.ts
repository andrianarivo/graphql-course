import {executor} from "../src/server"
import {parse} from "graphql"
import {prisma} from "../src/db"

beforeEach(async () => {
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test.user@mail.test',
      age: 32,
      password: 'admin1234',
    }
  })
  await prisma.post.create({
    data: {
      title: 'Test Post 1',
      body: 'Test Post Body 1',
      published: true,
      authorId: user.id
    }
  })
  await prisma.post.create({
    data: {
      title: 'Test Post 2',
      body: 'Test Post Body 2',
      published: false,
      authorId: user.id
    }
  })
  await prisma.post.create({
    data: {
      title: 'Test Post 3',
      body: 'Test Post Body 3',
      published: false,
      authorId: user.id
    }
  })
})

afterEach(async () => {
  const testUser = await prisma.user.findFirst({
    where: {
      email: 'test.user@mail.test'
    }
  })
  if (testUser) {
    await prisma.post.deleteMany({
      where: {
        authorId: testUser.id
      }
    })
    await prisma.user.delete({
      where: {
        email: 'test.user@mail.test',
      }
    })
  }

  await prisma.user.delete({
    where: {
      email: 'john.doe@mail.test'
    }
  })
})

test('This is my first test case', async () => {
  await executor({
    document: parse(/* GraphQL */ `
      mutation {
        createUser(data: {
          name: "John", 
          email: "john.doe@mail.test", 
          age: 42,
          password: "admin1234"
        }) {
          id
          name
        }
      } 
    `)
  })

  const createdUser = await prisma.user.findFirst({
    where: {
      email: 'john.doe@mail.test'
    }
  })

  expect(createdUser).toMatchObject({
    name: 'John',
    email: 'john.doe@mail.test',
    age: 42
  })
})