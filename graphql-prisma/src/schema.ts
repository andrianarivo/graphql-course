import { builder } from "./builder"

import "./models/User"
import "./models/Post"
import "./models/Comment"

import "./controllers/UsersController"
import "./controllers/PostsController"
import "./controllers/CommentsController"

export const schema = builder.toSchema({})