import {Comment, Post, User} from './generated/graphql'

const users: User[] = [
  {
    id: '1',
    name: 'Andrew',
    email: 'andrew@example.com',
    age: 27,
    posts: [],
    comments: []
  },
  {
    id: '2',
    name: 'Sarah',
    email: 'sarah@example.com',
    posts: [],
    comments: []
  },
  {
    id: '3',
    name: 'Mike',
    email: 'mike@example.com',
    posts: [],
    comments: []
  }
]
let posts: Post[] = [
  {
    id: '10',
    title: 'GraphQL 101',
    body: 'This is how to use GraphQL...',
    published: true,
    // @ts-ignore
    author: '1'
  },
  {
    id: '11',
    title: 'GraphQL 201',
    body: 'This is an advanced GraphQL post...',
    published: true,
    // @ts-ignore
    author: '1'
  },
  {
    id: '12',
    title: 'Programming Music',
    body: '',
    published: false,
    // @ts-ignore
    author: '3'
  }
]
let comments: Comment[] = [
  {
    id: '102',
    text: 'This worked well for me. Thanks!',
    // @ts-ignore
    author: '3',
    // @ts-ignore
    post: '10',
  },
  {
    id: '103',
    text: 'Glad you enjoyed it.',
    // @ts-ignore
    author: '1',
    // @ts-ignore
    post: '10',
  },
  {
    id: '104',
    text: 'This did not work.',
    // @ts-ignore
    author: '2',
    // @ts-ignore
    post: '11'
  },
  {
    id: '105',
    text: 'Nevermind. I got it to work.',
    // @ts-ignore
    author: '1',
    // @ts-ignore
    post: '11'
  }
]

const db = {
  users,
  posts,
  comments
}

export default db