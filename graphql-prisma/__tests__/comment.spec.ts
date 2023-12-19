import {
  auth0User,
  commentOne,
  commentTwo,
  setupDatabase,
  tearDownDatabase
} from "../src/utils/seedTestDatabase"
import buildExecutor from "../src/utils/buildExecutor"
import { deleteComment } from "../src/utils/operations"
import {prisma} from "../src/db"
import type { Comment } from "@prisma/client"

beforeAll(setupDatabase)
afterAll(tearDownDatabase)

test('Should delete own comment', async () => {
  const user = await auth0User
  const authExecutor = buildExecutor(user.access_token)
  const response = await authExecutor({
    document: deleteComment,
    variables: {
      ID: commentTwo.id
    }
  }) as { data: { deleteComment: Comment }}
  const { data } = response
  const deletedComment = await prisma.comment.findFirst({
    where: {
      id: parseInt(`${data.deleteComment.id}`)
    }
  })
  expect(deletedComment).toBeNull()
})

test('Should not delete other users comment', async () => {
  const user = await auth0User
  const authExecutor = buildExecutor(user.access_token)
  const response = await authExecutor({
    document: deleteComment,
    variables: {
      ID: commentOne.id
    }
  }) as { errors?: { message: string }[]}
  const { errors } = response
  expect(errors).toBeTruthy()
})