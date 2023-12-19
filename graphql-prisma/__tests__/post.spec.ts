import {Post} from "@prisma/client"
import {setupDatabase, tearDownDatabase, auth0User, postThree} from "../src/utils/seedTestDatabase"
import buildExecutor from "../src/utils/buildExecutor"
import {prisma} from "../src/db"
import {
  createPost,
  deletePost,
  getMyPosts,
  getPosts,
  subscribeToPosts,
  updatePost
} from "../src/utils/operations"

beforeAll(setupDatabase)
afterAll(async () => {
  await tearDownDatabase()
})

const executor = buildExecutor()

test('Should expose published posts', async () => {
  const response = await executor({
    document: getPosts,
  }) as { data: { posts: Post[] }}

  expect(response.data.posts.length).toBe(2)
  expect(response.data.posts[0].published).toBeTruthy()
})

test('Should fetch my posts', async () => {
  const user = await auth0User
  const authExecutor = buildExecutor(user.access_token)
  const response = await authExecutor({
    document: getMyPosts,
  }) as { data: { myPosts: Post[] }}
  expect(response.data.myPosts.length).toBe(1)
})

test('Should be able to update own post', async () => {
  const user = await auth0User
  const authExecutor = buildExecutor(user.access_token)
  const response = await authExecutor({
    document: updatePost,
    variables: {
      ID: postThree.id,
      data: {
        published: false
      }
    }
  }) as { data: { updatePost: Post }}
  const { data } = response
  expect(data.updatePost.published).toBeFalsy()
})

test('Should be able to create post', async () => {
  const user = await auth0User
  const authExecutor = buildExecutor(user.access_token)
  const response = await authExecutor({
    document: createPost,
    variables:{
      data:  {
        title: "Test Post 4",
        body: "Test Post Body 4",
        published: true
      }
    }
  }) as { data: { createPost: Post }}
  const { data } = response

  const createdPost = await prisma.post.findUnique({
    where: {
      id: parseInt(`${data.createPost.id}`)
    }
  })

  expect(createdPost?.title).toBe('Test Post 4')
  expect(createdPost?.body).toBe('Test Post Body 4')
  expect(createdPost?.published).toBeTruthy()
})

test('Should be able to delete post', async () => {
  const user = await auth0User
  const authExecutor = buildExecutor(user.access_token)

  const postToDelete = await prisma.post.findFirst({
    where: {
      title: 'Test Post 4'
    }
  })
  const response = await authExecutor({
    document: deletePost,
    variables: {
      ID: postToDelete?.id
    }
  }) as { data: { deletePost: Post }}
  const { data } = response
  const deletedPost = await prisma.post.findUnique({
    where: {
      id: parseInt(`${data.deletePost.id}`)
    }
  })
  expect(deletedPost).toBeNull()
})

test('Should subscribe to post', (done) => {
  const subscribe = async () => {
    const user = await auth0User
    const authExecutor = buildExecutor(user.access_token)
    const response = await authExecutor({
      document: subscribeToPosts
    }) as AsyncGenerator
    const iterator = response[Symbol.asyncIterator]()
    iterator.next().then(({ value }) => {
      expect(value.data.post.mutation).toBe('CREATED')
      done()
    })
    await authExecutor({
      document: updatePost,
      variables: {
        ID: postThree.id,
        data: {
          published: true
        }
      }
    })
  }
  subscribe()
})