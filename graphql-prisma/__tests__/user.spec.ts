import {executor} from "../src/server"
import {parse} from "graphql"
import {prisma} from "../src/db"
import {Post, User} from "@prisma/client"
import login from "../src/utils/login";

beforeAll(async () => {
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

afterAll(async () => {
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

test('Should create a new user', async () => {
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

test('Should expose public author profiles', async () => {
  const response = await executor({
    document: parse(/* GraphQL */ `
      query {
        users {
          id
          name
          email
        }
      }
    `)
  }) as { data: { users: User[] }}

  expect(response.data.users.length).toBe(10)
  expect(response.data.users[0].email).toBe('')
  expect(response.data.users[0].name).toBe('Damon Keebler')
})

test('Should expose published posts', async () => {
  const response = await executor({
    document: parse(/* GraphQL */ `
      query {
        posts {
          id
          title
          body
          published
        }
      }
    `)
  }) as { data: { posts: Post[] }}

  expect(response.data.posts.length).toBe(1)
  expect(response.data.posts[0].published).toBeTruthy()
})

test('Should not login with bad credentials', async () => {
  await expect(
    login({
      username: 'doesnt@exist.com',
      password: 'admin1234'
    })
  ).rejects.toThrow()
})

test('Should not signup with short password', async () => {
  const response = await executor({
    document: parse(/* GraphQL */ `
      mutation {
        createUser(data: {
          name: "Jane", 
          email: "jane.doe@mail.test", 
          age: 42,
          password: "a1"
        }) {
          id
          name
        }
      } 
    `)
  }) as any
  expect(response.errors[0].message).toBe('Password must be 8 characters or longer')
})