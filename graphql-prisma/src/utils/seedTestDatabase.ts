import {prisma} from "../db";
import login from "./login";
import {Post, User, Comment} from "@prisma/client";

let userOne: User
let userTwo: User
let postOne: Post
let postTwo: Post
let postThree: Post
let commentOne: Comment
let commentTwo: Comment
let commentThree: Comment

const setupDatabase = async () => {
  userOne = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test.user@mail.test',
      age: 32,
      password: 'admin1234',
    }
  })
  postOne = await prisma.post.create({
    data: {
      title: 'Test Post 1',
      body: 'Test Post Body 1',
      published: true,
      authorId: userOne.id
    }
  })
  postTwo = await prisma.post.create({
    data: {
      title: 'Test Post 2',
      body: 'Test Post Body 2',
      published: false,
      authorId: userOne.id
    }
  })
  postThree = await prisma.post.create({
    data: {
      title: 'Test Post 3',
      body: 'Test Post Body 3',
      published: true,
      authorId: 51
    }
  })
  userTwo = await prisma.user.create({
    data: {
      name: 'Test User 2',
      email: 'test.user2@mail.test',
      age: 32,
      password: 'admin1234'
    }
  })
  commentOne = await prisma.comment.create({
    data: {
      text: 'Test Comment 1',
      authorId: userTwo.id,
      postId: postOne.id
    }
  })
  commentTwo = await prisma.comment.create({
    data: {
      text: 'Test Comment 2',
      authorId: 51,
      postId: postOne.id
    }
  })
  commentThree = await prisma.comment.create({
    data: {
      text: 'Test Comment 3',
      authorId: 51,
      postId: postOne.id
    }
  })
}

const tearDownDatabase = async () => {
  await prisma.post.deleteMany({
    where: {
      OR: [
        { title: 'Test Post 3' },
        { title: 'Test Post 4' },
        { authorId: 51 },
        { authorId: userOne.id },
        { authorId: userTwo.id }
      ]
    }
  })
  await prisma.comment.deleteMany({
    where: {
      OR: [
        {authorId: 51},
        {authorId: userOne.id},
        {authorId: userTwo.id}
      ]
    }
  })
  await prisma.user.deleteMany({
    where: {
      OR: [
        {id: userOne.id},
        {id: userTwo.id}
      ]
    }
  })
}

const auth0User = login({
  username: 'Abagail_Towne@yahoo.com',
  password: 'admin1234',
})

export { setupDatabase, tearDownDatabase, auth0User, userOne, postOne, postTwo, postThree, userTwo, commentOne, commentTwo, commentThree };