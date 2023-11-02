import {Comment, Post, User} from './generated/graphql'

export interface Context {
  db: {
    users: User[];
    posts: Post[];
    comments: Comment[];
  };
}
