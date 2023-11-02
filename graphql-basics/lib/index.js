"use strict";

var _graphqlYoga = require("graphql-yoga");
var _http = require("http");
var _loadFiles = require("@graphql-tools/load-files");
var _uuid = require("uuid");
var _error = require("graphql/error");
async function main() {
  // Demo user data
  const users = [{
    id: '1',
    name: 'Andrew',
    email: 'andrew@example.com',
    age: 27,
    posts: [],
    comments: []
  }, {
    id: '2',
    name: 'Sarah',
    email: 'sarah@example.com',
    posts: [],
    comments: []
  }, {
    id: '3',
    name: 'Mike',
    email: 'mike@example.com',
    posts: [],
    comments: []
  }];
  let posts = [{
    id: '10',
    title: 'GraphQL 101',
    body: 'This is how to use GraphQL...',
    published: true,
    // @ts-ignore
    author: '1'
  }, {
    id: '11',
    title: 'GraphQL 201',
    body: 'This is an advanced GraphQL post...',
    published: true,
    // @ts-ignore
    author: '1'
  }, {
    id: '12',
    title: 'Programming Music',
    body: '',
    published: false,
    // @ts-ignore
    author: '3'
  }];
  let comments = [{
    id: '102',
    text: 'This worked well for me. Thanks!',
    // @ts-ignore
    author: '3',
    // @ts-ignore
    post: '10'
  }, {
    id: '103',
    text: 'Glad you enjoyed it.',
    // @ts-ignore
    author: '1',
    // @ts-ignore
    post: '10'
  }, {
    id: '104',
    text: 'This did not work.',
    // @ts-ignore
    author: '2',
    // @ts-ignore
    post: '11'
  }, {
    id: '105',
    text: 'Nevermind. I got it to work.',
    // @ts-ignore
    author: '1',
    // @ts-ignore
    post: '11'
  }];

  // Type definitions (schema)
  const typeDefs = await (0, _loadFiles.loadFiles)('**/*.graphql');

  // Resolvers
  const resolvers = {
    Query: {
      users(parent, args, ctx, info) {
        if (!args.query) {
          return users;
        }
        return users.filter(user => user.name.toLowerCase().includes(args.query.toLowerCase()));
      },
      posts(parent, args, ctx, info) {
        if (!args.query) {
          return posts;
        }
        return posts.filter(post => {
          const isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase());
          const isBodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase());
          return isTitleMatch || isBodyMatch;
        });
      },
      comments() {
        return comments;
      },
      me() {
        return users[1];
      },
      post() {
        return posts[1];
      }
    },
    Post: {
      author(parent, args, ctx, info) {
        return users.find(user => {
          return user.id === parent.author;
        });
      },
      comments(parent, args, ctx, info) {
        return comments.filter(comment => {
          return comment.post === parent.id;
        });
      }
    },
    User: {
      posts(parent, args, ctx, info) {
        return posts.filter(post => {
          return post.author === parent.id;
        });
      },
      comments(parent, args, ctx, info) {
        return comments.filter(comment => {
          return comment.author === parent.id;
        });
      }
    },
    Comment: {
      author(parent, args, ctx, info) {
        return users.find(user => user.id === parent.author);
      },
      post(parent, args, ctx, info) {
        return posts.find(post => post.id === parent.post);
      }
    },
    Mutation: {
      createUser(parent, args, ctx, info) {
        const emailTaken = users.some(user => user.email === args.data.email);
        if (emailTaken) {
          throw new _error.GraphQLError('Email taken.');
        }
        const user = {
          id: (0, _uuid.v4)(),
          comments: [],
          posts: [],
          ...args.data
        };
        users.push(user);
        return user;
      },
      deleteUser(parent, args, ctx, info) {
        const userIndex = users.findIndex(user => user.id === args.id);
        if (userIndex === -1) {
          throw new _error.GraphQLError('User not found.');
        }
        const deletedUsers = users.splice(userIndex, 1);
        posts = posts.filter(post => {
          const match = post.author === args.id;
          if (match) {
            comments = comments.filter(comment => comment.post !== post.id);
          }
          return !match;
        });
        return deletedUsers[0];
      },
      deletePost(parent, args, ctx, info) {
        const postIndex = posts.findIndex(post => post.id === args.id);
        if (postIndex === -1) {
          throw new _error.GraphQLError('Post not found.');
        }
        const deletedPosts = posts.splice(postIndex, 1);
        comments = comments.filter(comment => comment.post !== args.id);
        return deletedPosts[0];
      },
      createPost(parent, args, ctx, info) {
        const userExists = users.some(user => user.id === args.data.author);
        if (!userExists) {
          throw new _error.GraphQLError('User not found.');
        }
        const post = {
          id: (0, _uuid.v4)(),
          comments: [],
          title: args.data.title,
          body: args.data.body,
          published: args.data.published,
          // @ts-ignore
          author: args.data.author
        };
        posts.push(post);
        return post;
      },
      createComment(parent, args, ctx, info) {
        const userExists = users.some(user => user.id === args.data.author);
        if (!userExists) {
          throw new _error.GraphQLError('User not found.');
        }
        const postExists = posts.some(post => post.id === args.data.post && post.published);
        if (!postExists) {
          throw new _error.GraphQLError('Post not found.');
        }
        const comment = {
          id: (0, _uuid.v4)(),
          text: args.data.text,
          // @ts-ignore
          post: args.data.post,
          // @ts-ignore
          author: args.data.author
        };
        comments.push(comment);
        return comment;
      },
      deleteComment(parent, args, ctx, info) {
        const commentIndex = comments.findIndex(comment => comment.id === args.id);
        if (commentIndex === -1) {
          throw new _error.GraphQLError('Comment not found.');
        }
        const deletedComments = comments.splice(commentIndex, 1);
        return deletedComments[0];
      }
    }
  };
  const schema = (0, _graphqlYoga.createSchema)({
    typeDefs,
    resolvers
  });
  const yoga = (0, _graphqlYoga.createYoga)({
    schema
  });
  const server = (0, _http.createServer)(yoga);
  server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql');
  });
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZ3JhcGhxbFlvZ2EiLCJyZXF1aXJlIiwiX2h0dHAiLCJfbG9hZEZpbGVzIiwiX3V1aWQiLCJfZXJyb3IiLCJtYWluIiwidXNlcnMiLCJpZCIsIm5hbWUiLCJlbWFpbCIsImFnZSIsInBvc3RzIiwiY29tbWVudHMiLCJ0aXRsZSIsImJvZHkiLCJwdWJsaXNoZWQiLCJhdXRob3IiLCJ0ZXh0IiwicG9zdCIsInR5cGVEZWZzIiwibG9hZEZpbGVzIiwicmVzb2x2ZXJzIiwiUXVlcnkiLCJwYXJlbnQiLCJhcmdzIiwiY3R4IiwiaW5mbyIsInF1ZXJ5IiwiZmlsdGVyIiwidXNlciIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJpc1RpdGxlTWF0Y2giLCJpc0JvZHlNYXRjaCIsIm1lIiwiUG9zdCIsImZpbmQiLCJjb21tZW50IiwiVXNlciIsIkNvbW1lbnQiLCJNdXRhdGlvbiIsImNyZWF0ZVVzZXIiLCJlbWFpbFRha2VuIiwic29tZSIsImRhdGEiLCJHcmFwaFFMRXJyb3IiLCJ1dWlkdjQiLCJwdXNoIiwiZGVsZXRlVXNlciIsInVzZXJJbmRleCIsImZpbmRJbmRleCIsImRlbGV0ZWRVc2VycyIsInNwbGljZSIsIm1hdGNoIiwiZGVsZXRlUG9zdCIsInBvc3RJbmRleCIsImRlbGV0ZWRQb3N0cyIsImNyZWF0ZVBvc3QiLCJ1c2VyRXhpc3RzIiwiY3JlYXRlQ29tbWVudCIsInBvc3RFeGlzdHMiLCJkZWxldGVDb21tZW50IiwiY29tbWVudEluZGV4IiwiZGVsZXRlZENvbW1lbnRzIiwic2NoZW1hIiwiY3JlYXRlU2NoZW1hIiwieW9nYSIsImNyZWF0ZVlvZ2EiLCJzZXJ2ZXIiLCJjcmVhdGVTZXJ2ZXIiLCJsaXN0ZW4iLCJjb25zb2xlIiwiY2F0Y2giLCJlcnIiLCJlcnJvciIsInByb2Nlc3MiLCJleGl0Il0sInNvdXJjZXMiOlsiLi4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y3JlYXRlU2NoZW1hLCBjcmVhdGVZb2dhfSBmcm9tICdncmFwaHFsLXlvZ2EnXG5pbXBvcnQge2NyZWF0ZVNlcnZlcn0gZnJvbSAnaHR0cCdcbmltcG9ydCB7bG9hZEZpbGVzfSBmcm9tIFwiQGdyYXBocWwtdG9vbHMvbG9hZC1maWxlc1wiXG5pbXBvcnQge0NvbW1lbnQsIFBvc3QsIFJlc29sdmVycywgVXNlcn0gZnJvbSAnLi9nZW5lcmF0ZWQvZ3JhcGhxbCdcbmltcG9ydCB7djQgYXMgdXVpZHY0fSBmcm9tICd1dWlkJ1xuaW1wb3J0IHtHcmFwaFFMRXJyb3J9IGZyb20gXCJncmFwaHFsL2Vycm9yXCI7XG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKSB7XG5cbiAgLy8gRGVtbyB1c2VyIGRhdGFcbiAgY29uc3QgdXNlcnM6IFVzZXJbXSA9IFtcbiAgICB7XG4gICAgICBpZDogJzEnLFxuICAgICAgbmFtZTogJ0FuZHJldycsXG4gICAgICBlbWFpbDogJ2FuZHJld0BleGFtcGxlLmNvbScsXG4gICAgICBhZ2U6IDI3LFxuICAgICAgcG9zdHM6IFtdLFxuICAgICAgY29tbWVudHM6IFtdXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzInLFxuICAgICAgbmFtZTogJ1NhcmFoJyxcbiAgICAgIGVtYWlsOiAnc2FyYWhAZXhhbXBsZS5jb20nLFxuICAgICAgcG9zdHM6IFtdLFxuICAgICAgY29tbWVudHM6IFtdXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzMnLFxuICAgICAgbmFtZTogJ01pa2UnLFxuICAgICAgZW1haWw6ICdtaWtlQGV4YW1wbGUuY29tJyxcbiAgICAgIHBvc3RzOiBbXSxcbiAgICAgIGNvbW1lbnRzOiBbXVxuICAgIH1cbiAgXVxuICBsZXQgcG9zdHM6IFBvc3RbXSA9IFtcbiAgICB7XG4gICAgICBpZDogJzEwJyxcbiAgICAgIHRpdGxlOiAnR3JhcGhRTCAxMDEnLFxuICAgICAgYm9keTogJ1RoaXMgaXMgaG93IHRvIHVzZSBHcmFwaFFMLi4uJyxcbiAgICAgIHB1Ymxpc2hlZDogdHJ1ZSxcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGF1dGhvcjogJzEnXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzExJyxcbiAgICAgIHRpdGxlOiAnR3JhcGhRTCAyMDEnLFxuICAgICAgYm9keTogJ1RoaXMgaXMgYW4gYWR2YW5jZWQgR3JhcGhRTCBwb3N0Li4uJyxcbiAgICAgIHB1Ymxpc2hlZDogdHJ1ZSxcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGF1dGhvcjogJzEnXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzEyJyxcbiAgICAgIHRpdGxlOiAnUHJvZ3JhbW1pbmcgTXVzaWMnLFxuICAgICAgYm9keTogJycsXG4gICAgICBwdWJsaXNoZWQ6IGZhbHNlLFxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgYXV0aG9yOiAnMydcbiAgICB9XG4gIF1cbiAgbGV0IGNvbW1lbnRzOiBDb21tZW50W10gPSBbXG4gICAge1xuICAgICAgaWQ6ICcxMDInLFxuICAgICAgdGV4dDogJ1RoaXMgd29ya2VkIHdlbGwgZm9yIG1lLiBUaGFua3MhJyxcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGF1dGhvcjogJzMnLFxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgcG9zdDogJzEwJyxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnMTAzJyxcbiAgICAgIHRleHQ6ICdHbGFkIHlvdSBlbmpveWVkIGl0LicsXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBhdXRob3I6ICcxJyxcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHBvc3Q6ICcxMCcsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJzEwNCcsXG4gICAgICB0ZXh0OiAnVGhpcyBkaWQgbm90IHdvcmsuJyxcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGF1dGhvcjogJzInLFxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgcG9zdDogJzExJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICcxMDUnLFxuICAgICAgdGV4dDogJ05ldmVybWluZC4gSSBnb3QgaXQgdG8gd29yay4nLFxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgYXV0aG9yOiAnMScsXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBwb3N0OiAnMTEnXG4gICAgfVxuICBdXG5cbiAgLy8gVHlwZSBkZWZpbml0aW9ucyAoc2NoZW1hKVxuICBjb25zdCB0eXBlRGVmcyA9IGF3YWl0IGxvYWRGaWxlcygnKiovKi5ncmFwaHFsJylcblxuICAvLyBSZXNvbHZlcnNcbiAgY29uc3QgcmVzb2x2ZXJzOiBSZXNvbHZlcnMgPSB7XG4gICAgUXVlcnk6IHtcbiAgICAgIHVzZXJzKHBhcmVudCwgYXJncywgY3R4LCBpbmZvKSB7XG4gICAgICAgIGlmKCFhcmdzLnF1ZXJ5KSB7XG4gICAgICAgICAgcmV0dXJuIHVzZXJzXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVzZXJzLmZpbHRlcigodXNlcikgPT5cbiAgICAgICAgICAgIHVzZXIubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGFyZ3MucXVlcnkhLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgIClcbiAgICAgIH0sXG4gICAgICBwb3N0cyhwYXJlbnQsIGFyZ3MsIGN0eCwgaW5mbykge1xuICAgICAgICBpZighYXJncy5xdWVyeSkge1xuICAgICAgICAgIHJldHVybiBwb3N0c1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3N0cy5maWx0ZXIoKHBvc3QpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgaXNUaXRsZU1hdGNoID0gcG9zdC50aXRsZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGFyZ3MucXVlcnkhLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgICAgICAgIGNvbnN0IGlzQm9keU1hdGNoID0gcG9zdC5ib2R5LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoYXJncy5xdWVyeSEudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICAgICAgcmV0dXJuIGlzVGl0bGVNYXRjaCB8fCBpc0JvZHlNYXRjaFxuICAgICAgICAgICAgfVxuICAgICAgICApXG4gICAgICB9LFxuICAgICAgY29tbWVudHMoKSB7XG4gICAgICAgIHJldHVybiBjb21tZW50c1xuICAgICAgfSxcbiAgICAgIG1lKCkge1xuICAgICAgICByZXR1cm4gdXNlcnNbMV1cbiAgICAgIH0sXG4gICAgICBwb3N0KCkge1xuICAgICAgICByZXR1cm4gcG9zdHNbMV1cbiAgICAgIH1cbiAgICB9LFxuICAgIFBvc3Q6IHtcbiAgICAgIGF1dGhvcihwYXJlbnQsIGFyZ3MsIGN0eCwgaW5mbykge1xuICAgICAgICByZXR1cm4gdXNlcnMuZmluZCgodXNlcikgPT4ge1xuICAgICAgICAgIHJldHVybiB1c2VyLmlkID09PSAocGFyZW50LmF1dGhvciBhcyB1bmtub3duKVxuICAgICAgICB9KSFcbiAgICAgIH0sXG4gICAgICBjb21tZW50cyhwYXJlbnQsIGFyZ3MsIGN0eCwgaW5mbykge1xuICAgICAgICByZXR1cm4gY29tbWVudHMuZmlsdGVyKChjb21tZW50KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChjb21tZW50LnBvc3QgYXMgdW5rbm93bikgPT09IHBhcmVudC5pZFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sXG4gICAgVXNlcjoge1xuICAgICAgcG9zdHMocGFyZW50LCBhcmdzLCBjdHgsIGluZm8pIHtcbiAgICAgICAgcmV0dXJuIHBvc3RzLmZpbHRlcigocG9zdCkgPT4ge1xuICAgICAgICAgIHJldHVybiAocG9zdC5hdXRob3IgYXMgdW5rbm93bikgPT09IHBhcmVudC5pZFxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIGNvbW1lbnRzKHBhcmVudCwgYXJncywgY3R4LCBpbmZvKSB7XG4gICAgICAgIHJldHVybiBjb21tZW50cy5maWx0ZXIoKGNvbW1lbnQpID0+IHtcbiAgICAgICAgICByZXR1cm4gKGNvbW1lbnQuYXV0aG9yIGFzIHVua25vd24pID09PSBwYXJlbnQuaWRcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LFxuICAgIENvbW1lbnQ6IHtcbiAgICAgIGF1dGhvcihwYXJlbnQsIGFyZ3MsIGN0eCwgaW5mbykge1xuICAgICAgICByZXR1cm4gdXNlcnMuZmluZCgodXNlcikgPT4gdXNlci5pZCA9PT0gKHBhcmVudC5hdXRob3IgYXMgdW5rbm93bikpIVxuICAgICAgfSxcbiAgICAgIHBvc3QocGFyZW50LCBhcmdzLCBjdHgsIGluZm8pIHtcbiAgICAgICAgcmV0dXJuIHBvc3RzLmZpbmQoKHBvc3QpID0+IHBvc3QuaWQgPT09IChwYXJlbnQucG9zdCBhcyB1bmtub3duKSkhXG4gICAgICB9XG4gICAgfSxcbiAgICBNdXRhdGlvbjoge1xuICAgICAgY3JlYXRlVXNlcihwYXJlbnQsIGFyZ3MsIGN0eCwgaW5mbykge1xuICAgICAgICBjb25zdCBlbWFpbFRha2VuID0gdXNlcnMuc29tZSgodXNlcikgPT4gdXNlci5lbWFpbCA9PT0gYXJncy5kYXRhLmVtYWlsKVxuICAgICAgICBpZihlbWFpbFRha2VuKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEdyYXBoUUxFcnJvcignRW1haWwgdGFrZW4uJylcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVzZXI6IFVzZXIgPSB7XG4gICAgICAgICAgaWQ6IHV1aWR2NCgpLFxuICAgICAgICAgIGNvbW1lbnRzOiBbXSxcbiAgICAgICAgICBwb3N0czogW10sXG4gICAgICAgICAgLi4uYXJncy5kYXRhXG4gICAgICAgIH1cbiAgICAgICAgdXNlcnMucHVzaCh1c2VyKVxuXG4gICAgICAgIHJldHVybiB1c2VyXG4gICAgICB9LFxuICAgICAgZGVsZXRlVXNlcihwYXJlbnQsIGFyZ3MsIGN0eCwgaW5mbykge1xuICAgICAgICBjb25zdCB1c2VySW5kZXggPSB1c2Vycy5maW5kSW5kZXgoKHVzZXIpID0+IHVzZXIuaWQgPT09IGFyZ3MuaWQpXG4gICAgICAgIGlmICh1c2VySW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEdyYXBoUUxFcnJvcignVXNlciBub3QgZm91bmQuJylcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlbGV0ZWRVc2VycyA9IHVzZXJzLnNwbGljZSh1c2VySW5kZXgsIDEpXG5cbiAgICAgICAgcG9zdHMgPSBwb3N0cy5maWx0ZXIoKHBvc3QpID0+IHtcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IChwb3N0LmF1dGhvciBhcyB1bmtub3duKSA9PT0gYXJncy5pZFxuXG4gICAgICAgICAgaWYobWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjb21tZW50KSA9PiAoY29tbWVudC5wb3N0IGFzIHVua25vd24pICE9PSBwb3N0LmlkKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiAhbWF0Y2hcbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gZGVsZXRlZFVzZXJzWzBdXG4gICAgICB9LFxuICAgICAgZGVsZXRlUG9zdChwYXJlbnQsIGFyZ3MsIGN0eCwgaW5mbykge1xuICAgICAgICBjb25zdCBwb3N0SW5kZXggPSBwb3N0cy5maW5kSW5kZXgoKHBvc3QpID0+IHBvc3QuaWQgPT09IGFyZ3MuaWQpXG4gICAgICAgIGlmIChwb3N0SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEdyYXBoUUxFcnJvcignUG9zdCBub3QgZm91bmQuJylcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlbGV0ZWRQb3N0cyA9IHBvc3RzLnNwbGljZShwb3N0SW5kZXgsIDEpXG5cbiAgICAgICAgY29tbWVudHMgPSBjb21tZW50cy5maWx0ZXIoKGNvbW1lbnQpID0+IChjb21tZW50LnBvc3QgYXMgdW5rbm93bikgIT09IGFyZ3MuaWQpXG5cbiAgICAgICAgcmV0dXJuIGRlbGV0ZWRQb3N0c1swXVxuICAgICAgfSxcbiAgICAgIGNyZWF0ZVBvc3QocGFyZW50LCBhcmdzLCBjdHgsIGluZm8pIHtcbiAgICAgICAgY29uc3QgdXNlckV4aXN0cyA9IHVzZXJzLnNvbWUoKHVzZXIpID0+IHVzZXIuaWQgPT09IGFyZ3MuZGF0YS5hdXRob3IpXG4gICAgICAgIGlmKCF1c2VyRXhpc3RzKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEdyYXBoUUxFcnJvcignVXNlciBub3QgZm91bmQuJylcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBvc3Q6IFBvc3QgPSB7XG4gICAgICAgICAgaWQ6IHV1aWR2NCgpLFxuICAgICAgICAgIGNvbW1lbnRzOiBbXSxcbiAgICAgICAgICB0aXRsZTogYXJncy5kYXRhLnRpdGxlLFxuICAgICAgICAgIGJvZHk6IGFyZ3MuZGF0YS5ib2R5LFxuICAgICAgICAgIHB1Ymxpc2hlZDogYXJncy5kYXRhLnB1Ymxpc2hlZCxcbiAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgYXV0aG9yOiBhcmdzLmRhdGEuYXV0aG9yXG4gICAgICAgIH1cbiAgICAgICAgcG9zdHMucHVzaChwb3N0KVxuXG4gICAgICAgIHJldHVybiBwb3N0XG4gICAgICB9LFxuICAgICAgY3JlYXRlQ29tbWVudChwYXJlbnQsIGFyZ3MsIGN0eCwgaW5mbykge1xuICAgICAgICBjb25zdCB1c2VyRXhpc3RzID0gdXNlcnMuc29tZSgodXNlcikgPT4gdXNlci5pZCA9PT0gYXJncy5kYXRhLmF1dGhvcilcbiAgICAgICAgaWYoIXVzZXJFeGlzdHMpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgR3JhcGhRTEVycm9yKCdVc2VyIG5vdCBmb3VuZC4nKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcG9zdEV4aXN0cyA9IHBvc3RzLnNvbWUoKHBvc3QpID0+IHBvc3QuaWQgPT09IGFyZ3MuZGF0YS5wb3N0ICYmIHBvc3QucHVibGlzaGVkKVxuICAgICAgICBpZighcG9zdEV4aXN0cykge1xuICAgICAgICAgIHRocm93IG5ldyBHcmFwaFFMRXJyb3IoJ1Bvc3Qgbm90IGZvdW5kLicpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb21tZW50OiBDb21tZW50ID0ge1xuICAgICAgICAgIGlkOiB1dWlkdjQoKSxcbiAgICAgICAgICB0ZXh0OiBhcmdzLmRhdGEudGV4dCxcbiAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgcG9zdDogYXJncy5kYXRhLnBvc3QsXG4gICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgIGF1dGhvcjogYXJncy5kYXRhLmF1dGhvclxuICAgICAgICB9XG4gICAgICAgIGNvbW1lbnRzLnB1c2goY29tbWVudClcblxuICAgICAgICByZXR1cm4gY29tbWVudFxuICAgICAgfSxcbiAgICAgIGRlbGV0ZUNvbW1lbnQocGFyZW50LCBhcmdzLCBjdHgsIGluZm8pIHtcbiAgICAgICAgY29uc3QgY29tbWVudEluZGV4ID0gY29tbWVudHMuZmluZEluZGV4KChjb21tZW50KSA9PiBjb21tZW50LmlkID09PSBhcmdzLmlkKVxuICAgICAgICBpZiAoY29tbWVudEluZGV4ID09PSAtMSkge1xuICAgICAgICAgIHRocm93IG5ldyBHcmFwaFFMRXJyb3IoJ0NvbW1lbnQgbm90IGZvdW5kLicpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZWxldGVkQ29tbWVudHMgPSBjb21tZW50cy5zcGxpY2UoY29tbWVudEluZGV4LCAxKVxuXG4gICAgICAgIHJldHVybiBkZWxldGVkQ29tbWVudHNbMF1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBzY2hlbWEgPSBjcmVhdGVTY2hlbWEoe1xuICAgIHR5cGVEZWZzLFxuICAgIHJlc29sdmVyc1xuICB9KVxuXG4gIGNvbnN0IHlvZ2EgPSBjcmVhdGVZb2dhKHsgc2NoZW1hIH0pXG5cbiAgY29uc3Qgc2VydmVyID0gY3JlYXRlU2VydmVyKHlvZ2EpXG5cbiAgc2VydmVyLmxpc3Rlbig0MDAwLCAoKSA9PiB7XG4gICAgY29uc29sZS5pbmZvKCdTZXJ2ZXIgaXMgcnVubmluZyBvbiBodHRwOi8vbG9jYWxob3N0OjQwMDAvZ3JhcGhxbCcpXG4gIH0pXG59XG5cbm1haW4oKS5jYXRjaCgoZXJyKSA9PiB7XG4gIGNvbnNvbGUuZXJyb3IoZXJyKVxuICBwcm9jZXNzLmV4aXQoMSlcbn0pIl0sIm1hcHBpbmdzIjoiOztBQUFBLElBQUFBLFlBQUEsR0FBQUMsT0FBQTtBQUNBLElBQUFDLEtBQUEsR0FBQUQsT0FBQTtBQUNBLElBQUFFLFVBQUEsR0FBQUYsT0FBQTtBQUVBLElBQUFHLEtBQUEsR0FBQUgsT0FBQTtBQUNBLElBQUFJLE1BQUEsR0FBQUosT0FBQTtBQUVBLGVBQWVLLElBQUlBLENBQUEsRUFBRztFQUVwQjtFQUNBLE1BQU1DLEtBQWEsR0FBRyxDQUNwQjtJQUNFQyxFQUFFLEVBQUUsR0FBRztJQUNQQyxJQUFJLEVBQUUsUUFBUTtJQUNkQyxLQUFLLEVBQUUsb0JBQW9CO0lBQzNCQyxHQUFHLEVBQUUsRUFBRTtJQUNQQyxLQUFLLEVBQUUsRUFBRTtJQUNUQyxRQUFRLEVBQUU7RUFDWixDQUFDLEVBQ0Q7SUFDRUwsRUFBRSxFQUFFLEdBQUc7SUFDUEMsSUFBSSxFQUFFLE9BQU87SUFDYkMsS0FBSyxFQUFFLG1CQUFtQjtJQUMxQkUsS0FBSyxFQUFFLEVBQUU7SUFDVEMsUUFBUSxFQUFFO0VBQ1osQ0FBQyxFQUNEO0lBQ0VMLEVBQUUsRUFBRSxHQUFHO0lBQ1BDLElBQUksRUFBRSxNQUFNO0lBQ1pDLEtBQUssRUFBRSxrQkFBa0I7SUFDekJFLEtBQUssRUFBRSxFQUFFO0lBQ1RDLFFBQVEsRUFBRTtFQUNaLENBQUMsQ0FDRjtFQUNELElBQUlELEtBQWEsR0FBRyxDQUNsQjtJQUNFSixFQUFFLEVBQUUsSUFBSTtJQUNSTSxLQUFLLEVBQUUsYUFBYTtJQUNwQkMsSUFBSSxFQUFFLCtCQUErQjtJQUNyQ0MsU0FBUyxFQUFFLElBQUk7SUFDZjtJQUNBQyxNQUFNLEVBQUU7RUFDVixDQUFDLEVBQ0Q7SUFDRVQsRUFBRSxFQUFFLElBQUk7SUFDUk0sS0FBSyxFQUFFLGFBQWE7SUFDcEJDLElBQUksRUFBRSxxQ0FBcUM7SUFDM0NDLFNBQVMsRUFBRSxJQUFJO0lBQ2Y7SUFDQUMsTUFBTSxFQUFFO0VBQ1YsQ0FBQyxFQUNEO0lBQ0VULEVBQUUsRUFBRSxJQUFJO0lBQ1JNLEtBQUssRUFBRSxtQkFBbUI7SUFDMUJDLElBQUksRUFBRSxFQUFFO0lBQ1JDLFNBQVMsRUFBRSxLQUFLO0lBQ2hCO0lBQ0FDLE1BQU0sRUFBRTtFQUNWLENBQUMsQ0FDRjtFQUNELElBQUlKLFFBQW1CLEdBQUcsQ0FDeEI7SUFDRUwsRUFBRSxFQUFFLEtBQUs7SUFDVFUsSUFBSSxFQUFFLGtDQUFrQztJQUN4QztJQUNBRCxNQUFNLEVBQUUsR0FBRztJQUNYO0lBQ0FFLElBQUksRUFBRTtFQUNSLENBQUMsRUFDRDtJQUNFWCxFQUFFLEVBQUUsS0FBSztJQUNUVSxJQUFJLEVBQUUsc0JBQXNCO0lBQzVCO0lBQ0FELE1BQU0sRUFBRSxHQUFHO0lBQ1g7SUFDQUUsSUFBSSxFQUFFO0VBQ1IsQ0FBQyxFQUNEO0lBQ0VYLEVBQUUsRUFBRSxLQUFLO0lBQ1RVLElBQUksRUFBRSxvQkFBb0I7SUFDMUI7SUFDQUQsTUFBTSxFQUFFLEdBQUc7SUFDWDtJQUNBRSxJQUFJLEVBQUU7RUFDUixDQUFDLEVBQ0Q7SUFDRVgsRUFBRSxFQUFFLEtBQUs7SUFDVFUsSUFBSSxFQUFFLDhCQUE4QjtJQUNwQztJQUNBRCxNQUFNLEVBQUUsR0FBRztJQUNYO0lBQ0FFLElBQUksRUFBRTtFQUNSLENBQUMsQ0FDRjs7RUFFRDtFQUNBLE1BQU1DLFFBQVEsR0FBRyxNQUFNLElBQUFDLG9CQUFTLEVBQUMsY0FBYyxDQUFDOztFQUVoRDtFQUNBLE1BQU1DLFNBQW9CLEdBQUc7SUFDM0JDLEtBQUssRUFBRTtNQUNMaEIsS0FBS0EsQ0FBQ2lCLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxHQUFHLEVBQUVDLElBQUksRUFBRTtRQUM3QixJQUFHLENBQUNGLElBQUksQ0FBQ0csS0FBSyxFQUFFO1VBQ2QsT0FBT3JCLEtBQUs7UUFDZDtRQUNBLE9BQU9BLEtBQUssQ0FBQ3NCLE1BQU0sQ0FBRUMsSUFBSSxJQUNyQkEsSUFBSSxDQUFDckIsSUFBSSxDQUFDc0IsV0FBVyxDQUFDLENBQUMsQ0FBQ0MsUUFBUSxDQUFDUCxJQUFJLENBQUNHLEtBQUssQ0FBRUcsV0FBVyxDQUFDLENBQUMsQ0FDOUQsQ0FBQztNQUNILENBQUM7TUFDRG5CLEtBQUtBLENBQUNZLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxHQUFHLEVBQUVDLElBQUksRUFBRTtRQUM3QixJQUFHLENBQUNGLElBQUksQ0FBQ0csS0FBSyxFQUFFO1VBQ2QsT0FBT2hCLEtBQUs7UUFDZDtRQUNBLE9BQU9BLEtBQUssQ0FBQ2lCLE1BQU0sQ0FBRVYsSUFBSSxJQUFLO1VBQ3hCLE1BQU1jLFlBQVksR0FBR2QsSUFBSSxDQUFDTCxLQUFLLENBQUNpQixXQUFXLENBQUMsQ0FBQyxDQUFDQyxRQUFRLENBQUNQLElBQUksQ0FBQ0csS0FBSyxDQUFFRyxXQUFXLENBQUMsQ0FBQyxDQUFDO1VBQ2pGLE1BQU1HLFdBQVcsR0FBR2YsSUFBSSxDQUFDSixJQUFJLENBQUNnQixXQUFXLENBQUMsQ0FBQyxDQUFDQyxRQUFRLENBQUNQLElBQUksQ0FBQ0csS0FBSyxDQUFFRyxXQUFXLENBQUMsQ0FBQyxDQUFDO1VBQy9FLE9BQU9FLFlBQVksSUFBSUMsV0FBVztRQUNwQyxDQUNKLENBQUM7TUFDSCxDQUFDO01BQ0RyQixRQUFRQSxDQUFBLEVBQUc7UUFDVCxPQUFPQSxRQUFRO01BQ2pCLENBQUM7TUFDRHNCLEVBQUVBLENBQUEsRUFBRztRQUNILE9BQU81QixLQUFLLENBQUMsQ0FBQyxDQUFDO01BQ2pCLENBQUM7TUFDRFksSUFBSUEsQ0FBQSxFQUFHO1FBQ0wsT0FBT1AsS0FBSyxDQUFDLENBQUMsQ0FBQztNQUNqQjtJQUNGLENBQUM7SUFDRHdCLElBQUksRUFBRTtNQUNKbkIsTUFBTUEsQ0FBQ08sTUFBTSxFQUFFQyxJQUFJLEVBQUVDLEdBQUcsRUFBRUMsSUFBSSxFQUFFO1FBQzlCLE9BQU9wQixLQUFLLENBQUM4QixJQUFJLENBQUVQLElBQUksSUFBSztVQUMxQixPQUFPQSxJQUFJLENBQUN0QixFQUFFLEtBQU1nQixNQUFNLENBQUNQLE1BQWtCO1FBQy9DLENBQUMsQ0FBQztNQUNKLENBQUM7TUFDREosUUFBUUEsQ0FBQ1csTUFBTSxFQUFFQyxJQUFJLEVBQUVDLEdBQUcsRUFBRUMsSUFBSSxFQUFFO1FBQ2hDLE9BQU9kLFFBQVEsQ0FBQ2dCLE1BQU0sQ0FBRVMsT0FBTyxJQUFLO1VBQ2xDLE9BQVFBLE9BQU8sQ0FBQ25CLElBQUksS0FBaUJLLE1BQU0sQ0FBQ2hCLEVBQUU7UUFDaEQsQ0FBQyxDQUFDO01BQ0o7SUFDRixDQUFDO0lBQ0QrQixJQUFJLEVBQUU7TUFDSjNCLEtBQUtBLENBQUNZLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxHQUFHLEVBQUVDLElBQUksRUFBRTtRQUM3QixPQUFPZixLQUFLLENBQUNpQixNQUFNLENBQUVWLElBQUksSUFBSztVQUM1QixPQUFRQSxJQUFJLENBQUNGLE1BQU0sS0FBaUJPLE1BQU0sQ0FBQ2hCLEVBQUU7UUFDL0MsQ0FBQyxDQUFDO01BQ0osQ0FBQztNQUNESyxRQUFRQSxDQUFDVyxNQUFNLEVBQUVDLElBQUksRUFBRUMsR0FBRyxFQUFFQyxJQUFJLEVBQUU7UUFDaEMsT0FBT2QsUUFBUSxDQUFDZ0IsTUFBTSxDQUFFUyxPQUFPLElBQUs7VUFDbEMsT0FBUUEsT0FBTyxDQUFDckIsTUFBTSxLQUFpQk8sTUFBTSxDQUFDaEIsRUFBRTtRQUNsRCxDQUFDLENBQUM7TUFDSjtJQUNGLENBQUM7SUFDRGdDLE9BQU8sRUFBRTtNQUNQdkIsTUFBTUEsQ0FBQ08sTUFBTSxFQUFFQyxJQUFJLEVBQUVDLEdBQUcsRUFBRUMsSUFBSSxFQUFFO1FBQzlCLE9BQU9wQixLQUFLLENBQUM4QixJQUFJLENBQUVQLElBQUksSUFBS0EsSUFBSSxDQUFDdEIsRUFBRSxLQUFNZ0IsTUFBTSxDQUFDUCxNQUFrQixDQUFDO01BQ3JFLENBQUM7TUFDREUsSUFBSUEsQ0FBQ0ssTUFBTSxFQUFFQyxJQUFJLEVBQUVDLEdBQUcsRUFBRUMsSUFBSSxFQUFFO1FBQzVCLE9BQU9mLEtBQUssQ0FBQ3lCLElBQUksQ0FBRWxCLElBQUksSUFBS0EsSUFBSSxDQUFDWCxFQUFFLEtBQU1nQixNQUFNLENBQUNMLElBQWdCLENBQUM7TUFDbkU7SUFDRixDQUFDO0lBQ0RzQixRQUFRLEVBQUU7TUFDUkMsVUFBVUEsQ0FBQ2xCLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxHQUFHLEVBQUVDLElBQUksRUFBRTtRQUNsQyxNQUFNZ0IsVUFBVSxHQUFHcEMsS0FBSyxDQUFDcUMsSUFBSSxDQUFFZCxJQUFJLElBQUtBLElBQUksQ0FBQ3BCLEtBQUssS0FBS2UsSUFBSSxDQUFDb0IsSUFBSSxDQUFDbkMsS0FBSyxDQUFDO1FBQ3ZFLElBQUdpQyxVQUFVLEVBQUU7VUFDYixNQUFNLElBQUlHLG1CQUFZLENBQUMsY0FBYyxDQUFDO1FBQ3hDO1FBRUEsTUFBTWhCLElBQVUsR0FBRztVQUNqQnRCLEVBQUUsRUFBRSxJQUFBdUMsUUFBTSxFQUFDLENBQUM7VUFDWmxDLFFBQVEsRUFBRSxFQUFFO1VBQ1pELEtBQUssRUFBRSxFQUFFO1VBQ1QsR0FBR2EsSUFBSSxDQUFDb0I7UUFDVixDQUFDO1FBQ0R0QyxLQUFLLENBQUN5QyxJQUFJLENBQUNsQixJQUFJLENBQUM7UUFFaEIsT0FBT0EsSUFBSTtNQUNiLENBQUM7TUFDRG1CLFVBQVVBLENBQUN6QixNQUFNLEVBQUVDLElBQUksRUFBRUMsR0FBRyxFQUFFQyxJQUFJLEVBQUU7UUFDbEMsTUFBTXVCLFNBQVMsR0FBRzNDLEtBQUssQ0FBQzRDLFNBQVMsQ0FBRXJCLElBQUksSUFBS0EsSUFBSSxDQUFDdEIsRUFBRSxLQUFLaUIsSUFBSSxDQUFDakIsRUFBRSxDQUFDO1FBQ2hFLElBQUkwQyxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUU7VUFDcEIsTUFBTSxJQUFJSixtQkFBWSxDQUFDLGlCQUFpQixDQUFDO1FBQzNDO1FBRUEsTUFBTU0sWUFBWSxHQUFHN0MsS0FBSyxDQUFDOEMsTUFBTSxDQUFDSCxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBRS9DdEMsS0FBSyxHQUFHQSxLQUFLLENBQUNpQixNQUFNLENBQUVWLElBQUksSUFBSztVQUM3QixNQUFNbUMsS0FBSyxHQUFJbkMsSUFBSSxDQUFDRixNQUFNLEtBQWlCUSxJQUFJLENBQUNqQixFQUFFO1VBRWxELElBQUc4QyxLQUFLLEVBQUU7WUFDUnpDLFFBQVEsR0FBR0EsUUFBUSxDQUFDZ0IsTUFBTSxDQUFFUyxPQUFPLElBQU1BLE9BQU8sQ0FBQ25CLElBQUksS0FBaUJBLElBQUksQ0FBQ1gsRUFBRSxDQUFDO1VBQ2hGO1VBRUEsT0FBTyxDQUFDOEMsS0FBSztRQUNmLENBQUMsQ0FBQztRQUVGLE9BQU9GLFlBQVksQ0FBQyxDQUFDLENBQUM7TUFDeEIsQ0FBQztNQUNERyxVQUFVQSxDQUFDL0IsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLEdBQUcsRUFBRUMsSUFBSSxFQUFFO1FBQ2xDLE1BQU02QixTQUFTLEdBQUc1QyxLQUFLLENBQUN1QyxTQUFTLENBQUVoQyxJQUFJLElBQUtBLElBQUksQ0FBQ1gsRUFBRSxLQUFLaUIsSUFBSSxDQUFDakIsRUFBRSxDQUFDO1FBQ2hFLElBQUlnRCxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUU7VUFDcEIsTUFBTSxJQUFJVixtQkFBWSxDQUFDLGlCQUFpQixDQUFDO1FBQzNDO1FBRUEsTUFBTVcsWUFBWSxHQUFHN0MsS0FBSyxDQUFDeUMsTUFBTSxDQUFDRyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBRS9DM0MsUUFBUSxHQUFHQSxRQUFRLENBQUNnQixNQUFNLENBQUVTLE9BQU8sSUFBTUEsT0FBTyxDQUFDbkIsSUFBSSxLQUFpQk0sSUFBSSxDQUFDakIsRUFBRSxDQUFDO1FBRTlFLE9BQU9pRCxZQUFZLENBQUMsQ0FBQyxDQUFDO01BQ3hCLENBQUM7TUFDREMsVUFBVUEsQ0FBQ2xDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxHQUFHLEVBQUVDLElBQUksRUFBRTtRQUNsQyxNQUFNZ0MsVUFBVSxHQUFHcEQsS0FBSyxDQUFDcUMsSUFBSSxDQUFFZCxJQUFJLElBQUtBLElBQUksQ0FBQ3RCLEVBQUUsS0FBS2lCLElBQUksQ0FBQ29CLElBQUksQ0FBQzVCLE1BQU0sQ0FBQztRQUNyRSxJQUFHLENBQUMwQyxVQUFVLEVBQUU7VUFDZCxNQUFNLElBQUliLG1CQUFZLENBQUMsaUJBQWlCLENBQUM7UUFDM0M7UUFFQSxNQUFNM0IsSUFBVSxHQUFHO1VBQ2pCWCxFQUFFLEVBQUUsSUFBQXVDLFFBQU0sRUFBQyxDQUFDO1VBQ1psQyxRQUFRLEVBQUUsRUFBRTtVQUNaQyxLQUFLLEVBQUVXLElBQUksQ0FBQ29CLElBQUksQ0FBQy9CLEtBQUs7VUFDdEJDLElBQUksRUFBRVUsSUFBSSxDQUFDb0IsSUFBSSxDQUFDOUIsSUFBSTtVQUNwQkMsU0FBUyxFQUFFUyxJQUFJLENBQUNvQixJQUFJLENBQUM3QixTQUFTO1VBQzlCO1VBQ0FDLE1BQU0sRUFBRVEsSUFBSSxDQUFDb0IsSUFBSSxDQUFDNUI7UUFDcEIsQ0FBQztRQUNETCxLQUFLLENBQUNvQyxJQUFJLENBQUM3QixJQUFJLENBQUM7UUFFaEIsT0FBT0EsSUFBSTtNQUNiLENBQUM7TUFDRHlDLGFBQWFBLENBQUNwQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsR0FBRyxFQUFFQyxJQUFJLEVBQUU7UUFDckMsTUFBTWdDLFVBQVUsR0FBR3BELEtBQUssQ0FBQ3FDLElBQUksQ0FBRWQsSUFBSSxJQUFLQSxJQUFJLENBQUN0QixFQUFFLEtBQUtpQixJQUFJLENBQUNvQixJQUFJLENBQUM1QixNQUFNLENBQUM7UUFDckUsSUFBRyxDQUFDMEMsVUFBVSxFQUFFO1VBQ2QsTUFBTSxJQUFJYixtQkFBWSxDQUFDLGlCQUFpQixDQUFDO1FBQzNDO1FBRUEsTUFBTWUsVUFBVSxHQUFHakQsS0FBSyxDQUFDZ0MsSUFBSSxDQUFFekIsSUFBSSxJQUFLQSxJQUFJLENBQUNYLEVBQUUsS0FBS2lCLElBQUksQ0FBQ29CLElBQUksQ0FBQzFCLElBQUksSUFBSUEsSUFBSSxDQUFDSCxTQUFTLENBQUM7UUFDckYsSUFBRyxDQUFDNkMsVUFBVSxFQUFFO1VBQ2QsTUFBTSxJQUFJZixtQkFBWSxDQUFDLGlCQUFpQixDQUFDO1FBQzNDO1FBRUEsTUFBTVIsT0FBZ0IsR0FBRztVQUN2QjlCLEVBQUUsRUFBRSxJQUFBdUMsUUFBTSxFQUFDLENBQUM7VUFDWjdCLElBQUksRUFBRU8sSUFBSSxDQUFDb0IsSUFBSSxDQUFDM0IsSUFBSTtVQUNwQjtVQUNBQyxJQUFJLEVBQUVNLElBQUksQ0FBQ29CLElBQUksQ0FBQzFCLElBQUk7VUFDcEI7VUFDQUYsTUFBTSxFQUFFUSxJQUFJLENBQUNvQixJQUFJLENBQUM1QjtRQUNwQixDQUFDO1FBQ0RKLFFBQVEsQ0FBQ21DLElBQUksQ0FBQ1YsT0FBTyxDQUFDO1FBRXRCLE9BQU9BLE9BQU87TUFDaEIsQ0FBQztNQUNEd0IsYUFBYUEsQ0FBQ3RDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxHQUFHLEVBQUVDLElBQUksRUFBRTtRQUNyQyxNQUFNb0MsWUFBWSxHQUFHbEQsUUFBUSxDQUFDc0MsU0FBUyxDQUFFYixPQUFPLElBQUtBLE9BQU8sQ0FBQzlCLEVBQUUsS0FBS2lCLElBQUksQ0FBQ2pCLEVBQUUsQ0FBQztRQUM1RSxJQUFJdUQsWUFBWSxLQUFLLENBQUMsQ0FBQyxFQUFFO1VBQ3ZCLE1BQU0sSUFBSWpCLG1CQUFZLENBQUMsb0JBQW9CLENBQUM7UUFDOUM7UUFFQSxNQUFNa0IsZUFBZSxHQUFHbkQsUUFBUSxDQUFDd0MsTUFBTSxDQUFDVSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBRXhELE9BQU9DLGVBQWUsQ0FBQyxDQUFDLENBQUM7TUFDM0I7SUFDRjtFQUNGLENBQUM7RUFFRCxNQUFNQyxNQUFNLEdBQUcsSUFBQUMseUJBQVksRUFBQztJQUMxQjlDLFFBQVE7SUFDUkU7RUFDRixDQUFDLENBQUM7RUFFRixNQUFNNkMsSUFBSSxHQUFHLElBQUFDLHVCQUFVLEVBQUM7SUFBRUg7RUFBTyxDQUFDLENBQUM7RUFFbkMsTUFBTUksTUFBTSxHQUFHLElBQUFDLGtCQUFZLEVBQUNILElBQUksQ0FBQztFQUVqQ0UsTUFBTSxDQUFDRSxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU07SUFDeEJDLE9BQU8sQ0FBQzdDLElBQUksQ0FBQyxvREFBb0QsQ0FBQztFQUNwRSxDQUFDLENBQUM7QUFDSjtBQUVBckIsSUFBSSxDQUFDLENBQUMsQ0FBQ21FLEtBQUssQ0FBRUMsR0FBRyxJQUFLO0VBQ3BCRixPQUFPLENBQUNHLEtBQUssQ0FBQ0QsR0FBRyxDQUFDO0VBQ2xCRSxPQUFPLENBQUNDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQyxDQUFDIn0=