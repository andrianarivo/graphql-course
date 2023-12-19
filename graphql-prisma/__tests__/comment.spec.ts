import {
  auth0User,
  commentOne, commentThree,
  commentTwo, postOne, postTwo,
  setupDatabase,
  tearDownDatabase
} from "../src/utils/seedTestDatabase"
import buildExecutor from "../src/utils/buildExecutor"
import {deleteComment, subscribeToComments} from "../src/utils/operations"
import {prisma} from "../src/db"
import type { Comment } from "@prisma/client"

beforeAll(setupDatabase)
afterAll(tearDownDatabase)

const executor = buildExecutor()

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

test('Should subscript to comments for a post',  (done) => {
  const subscribe = async () => {
    const user = await auth0User
    const authExecutor = buildExecutor(user.access_token)
    const response = await authExecutor({
      document: subscribeToComments,
      variables: {
        ID: postOne.id
      }
    }) as AsyncGenerator
    const iterator = response[Symbol.asyncIterator]()
    iterator.next().then(({ value }) => {
      expect(value.data.comment.mutation).toBe('DELETED')
      done()
    })
    await authExecutor({
      document: deleteComment,
      variables: {
        ID: commentThree.id
      }
    })
  }
  subscribe()
})