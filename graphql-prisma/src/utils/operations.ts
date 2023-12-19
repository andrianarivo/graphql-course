import {parse} from "graphql"

const createUser =  parse(/* GraphQL */`
  mutation($data: CreateUserInput!) {
    createUser(data: $data) {
      id
      name
    }
  } 
`)

const getProfile = parse(/* GraphQL */ `
  query {
    me {
      id
      name
      email
    }
  }
`)

const getUsers = parse(/* GraphQL */ `
  query {
    users {
      id
      name
      email
    }
  }
`)

const getPosts =  parse(/* GraphQL */ `
  query {
    posts {
      id
      title
      body
      published
    }
  }
`)

const getMyPosts = parse(/* GraphQL */ `
  query {
    myPosts {
      id
      title
      body
      published
    }
  }
`)

const updatePosts = parse(/* GraphQL */ `
  mutation($ID: Int!, $data: UpdatePostInput!) {
    updatePost(id: $ID, data: $data) {
      id
      title
      body
      published
    }
  }
`)

const createPost = parse(/* GraphQL */ `
  mutation($data: CreatePostInput!){
    createPost(data: $data) {
      id
      title
      body
      published
    }
  }
`)

const deletePost =  parse(/* GraphQL */ `
  mutation($ID: Int!) {
    deletePost(id: $ID) {
      id
      title
      body
      published
    }
  }
`)

const deleteComment =  parse(/* GraphQL */ `
  mutation($ID: Int!) {
    deleteComment(id: $ID) {
      id
      text
    }
  }
`)

export { createUser, getProfile, getUsers, getPosts, getMyPosts, updatePosts, createPost, deletePost, deleteComment }