import {prisma} from "../src/db"
import {Post, User} from "@prisma/client"
import login from "../src/utils/login"
import {setupDatabase, tearDownDatabase, auth0User} from "../src/utils/seedTestDatabase"
import buildExecutor from "../src/utils/buildExecutor"
import {createUser, getProfile, getUsers} from "../src/utils/operations"

beforeAll(setupDatabase)
afterAll(async () => {
  await tearDownDatabase()

  await prisma.user.delete({
    where: {
      email: 'john.doe@mail.test'
    }
  })
})

const executor = buildExecutor()

test('Should create a new user', async () => {
  await executor({
    document: createUser,
    variables: {
      data: {
        name: "John",
        email: "john.doe@mail.test",
        age: 42,
        password: "admin1234"
      }
    }
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
    document: getUsers
  }) as { data: { users: User[] }}

  expect(response.data.users.length).toBe(10)
  expect(response.data.users[0].email).toBe('')
  expect(response.data.users[0].name).toBe('Damon Keebler')
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
    document: createUser,
    variables: {
      data: {
        name: "Jane",
        email: "jane.doe@mail.test",
        age: 42,
        password: "a1"
      }
    }
  }) as any
  expect(response.errors[0].message).toBe('Password must be 8 characters or longer')
})

test('Should fetch user profile', async () => {
  const user = await auth0User
  const authExecutor = buildExecutor(user.access_token)
  const response = await authExecutor({
    document: getProfile
  }) as { data: { me: User }}
  expect(response.data.me.id).toBe('51')
  expect(response.data.me.name).toBe('Carol Kulas')
  expect(response.data.me.email).toBe('Abagail_Towne@yahoo.com')
})