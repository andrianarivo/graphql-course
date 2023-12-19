import {prisma} from "../db";
import login from "./login";
import {Post, User, Comment} from "@prisma/client";

let userOne: User
let userTwo: User
let postOne: Post
let postTwo: Post
let commentOne: Comment
let commentTwo: Comment

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
}

const tearDownDatabase = async () => {
  await prisma.comment.deleteMany({
    where: {
      authorId: 51
    }
  })
  await prisma.comment.deleteMany({
    where: {
      authorId: userOne.id
    }
  })
  await prisma.comment.deleteMany({
    where: {
      authorId: userTwo.id
    }
  })
  await prisma.post.deleteMany({
    where: {
      authorId: userOne.id
    }
  })
  await prisma.user.delete({
    where: {
      id: userOne.id
    }
  })
  await prisma.user.delete({
    where: {
      id: userTwo.id
    }
  })
}

const auth0User = login({
  username: 'Abagail_Towne@yahoo.com',
  password: 'admin1234',
})

export { setupDatabase, tearDownDatabase, auth0User, userOne, postOne, postTwo, userTwo, commentOne, commentTwo };