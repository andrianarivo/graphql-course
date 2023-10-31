"use strict";

var _graphqlYoga = require("graphql-yoga");
var _http = require("http");
// Type definitions (schema)
const typeDefs = `
  type Query {
    hello: String!
    name: String!
    location: String!
    bio: String!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    hello() {
      return 'This is my first query!';
    },
    name() {
      return 'David Andrianarvio';
    },
    location() {
      return 'Madagascar';
    },
    bio() {
      return 'I am a 28 years old professional from Madagascar';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZ3JhcGhxbFlvZ2EiLCJyZXF1aXJlIiwiX2h0dHAiLCJ0eXBlRGVmcyIsInJlc29sdmVycyIsIlF1ZXJ5IiwiaGVsbG8iLCJuYW1lIiwibG9jYXRpb24iLCJiaW8iLCJzY2hlbWEiLCJjcmVhdGVTY2hlbWEiLCJ5b2dhIiwiY3JlYXRlWW9nYSIsInNlcnZlciIsImNyZWF0ZVNlcnZlciIsImxpc3RlbiIsImNvbnNvbGUiLCJpbmZvIl0sInNvdXJjZXMiOlsiLi4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZVlvZ2EgfSBmcm9tICdncmFwaHFsLXlvZ2EnXG5pbXBvcnQgeyBjcmVhdGVTY2hlbWEgfSBmcm9tICdncmFwaHFsLXlvZ2EnXG5pbXBvcnQgeyBjcmVhdGVTZXJ2ZXIgfSBmcm9tICdodHRwJ1xuXG4vLyBUeXBlIGRlZmluaXRpb25zIChzY2hlbWEpXG5jb25zdCB0eXBlRGVmcyA9IGBcbiAgdHlwZSBRdWVyeSB7XG4gICAgaGVsbG86IFN0cmluZyFcbiAgICBuYW1lOiBTdHJpbmchXG4gICAgbG9jYXRpb246IFN0cmluZyFcbiAgICBiaW86IFN0cmluZyFcbiAgfVxuYFxuXG4vLyBSZXNvbHZlcnNcbmNvbnN0IHJlc29sdmVycyA9IHtcbiAgUXVlcnk6IHtcbiAgICBoZWxsbygpIHtcbiAgICAgIHJldHVybiAnVGhpcyBpcyBteSBmaXJzdCBxdWVyeSEnXG4gICAgfSxcbiAgICBuYW1lKCkge1xuICAgICAgcmV0dXJuICdEYXZpZCBBbmRyaWFuYXJ2aW8nXG4gICAgfSxcbiAgICBsb2NhdGlvbigpIHtcbiAgICAgIHJldHVybiAnTWFkYWdhc2NhcidcbiAgICB9LFxuICAgIGJpbygpIHtcbiAgICAgIHJldHVybiAnSSBhbSBhIDI4IHllYXJzIG9sZCBwcm9mZXNzaW9uYWwgZnJvbSBNYWRhZ2FzY2FyJ1xuICAgIH1cbiAgfVxufVxuXG5jb25zdCBzY2hlbWEgPSBjcmVhdGVTY2hlbWEoe1xuICB0eXBlRGVmcyxcbiAgcmVzb2x2ZXJzXG59KVxuXG5jb25zdCB5b2dhID0gY3JlYXRlWW9nYSh7IHNjaGVtYSB9KVxuXG5jb25zdCBzZXJ2ZXIgPSBjcmVhdGVTZXJ2ZXIoeW9nYSlcblxuc2VydmVyLmxpc3Rlbig0MDAwLCAoKSA9PiB7XG4gIGNvbnNvbGUuaW5mbygnU2VydmVyIGlzIHJ1bm5pbmcgb24gaHR0cDovL2xvY2FsaG9zdDo0MDAwL2dyYXBocWwnKVxufSkiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBQUEsWUFBQSxHQUFBQyxPQUFBO0FBRUEsSUFBQUMsS0FBQSxHQUFBRCxPQUFBO0FBRUE7QUFDQSxNQUFNRSxRQUFRLEdBQUk7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBLE1BQU1DLFNBQVMsR0FBRztFQUNoQkMsS0FBSyxFQUFFO0lBQ0xDLEtBQUtBLENBQUEsRUFBRztNQUNOLE9BQU8seUJBQXlCO0lBQ2xDLENBQUM7SUFDREMsSUFBSUEsQ0FBQSxFQUFHO01BQ0wsT0FBTyxvQkFBb0I7SUFDN0IsQ0FBQztJQUNEQyxRQUFRQSxDQUFBLEVBQUc7TUFDVCxPQUFPLFlBQVk7SUFDckIsQ0FBQztJQUNEQyxHQUFHQSxDQUFBLEVBQUc7TUFDSixPQUFPLGtEQUFrRDtJQUMzRDtFQUNGO0FBQ0YsQ0FBQztBQUVELE1BQU1DLE1BQU0sR0FBRyxJQUFBQyx5QkFBWSxFQUFDO0VBQzFCUixRQUFRO0VBQ1JDO0FBQ0YsQ0FBQyxDQUFDO0FBRUYsTUFBTVEsSUFBSSxHQUFHLElBQUFDLHVCQUFVLEVBQUM7RUFBRUg7QUFBTyxDQUFDLENBQUM7QUFFbkMsTUFBTUksTUFBTSxHQUFHLElBQUFDLGtCQUFZLEVBQUNILElBQUksQ0FBQztBQUVqQ0UsTUFBTSxDQUFDRSxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU07RUFDeEJDLE9BQU8sQ0FBQ0MsSUFBSSxDQUFDLG9EQUFvRCxDQUFDO0FBQ3BFLENBQUMsQ0FBQyJ9